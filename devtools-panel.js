(function() {
  'use strict';

  // ====== State ======
  var requests = [];
  var selectedId = null;
  var rules = [];
  var ruleHits = {};
  var totalHits = 0;
  var editingRule = null;
  var isEditMode = false;
  var DEFAULT_GROUP = '默认分组';
  var DEFAULT_REPLAY_GROUP = '默认分组';
  var groups = [DEFAULT_GROUP];
  var activeGroup = DEFAULT_GROUP;
  var replayGroups = [DEFAULT_REPLAY_GROUP];
  var activeReplayGroup = DEFAULT_REPLAY_GROUP;
  var replayHistorySearchText = '';
  var networkSearchText = '';
  var networkFilterType = 'all';
  var selectedRuleIds = {};
  var selectedReplayHistoryIds = {};

  // ====== DOM ======
  var $ = function(id) { return document.getElementById(id); };

  // Tabs
  var tabNav = document.querySelector('.tab-nav');
  var tabMock = $('tabMock');
  var tabNetwork = $('tabNetwork');
  var tabBeacon = $('tabBeacon');
  var tabThrottle = $('tabThrottle');
  var tabCookies = $('tabCookies');
  var tabReplay = $('tabReplay');

  // Mock
  var mockList = $('mockList');
  var mockEmpty = $('mockEmpty');
  var mockStats = $('mockStats');
  var mockAddBtn = $('mockAddBtn');
  var clearHitsBtn = $('clearHitsBtn');
  var totalHitsCount = $('totalHitsCount');
  var mockTabStatusDot = $('mockTabStatusDot');
  var toggleAllCb = $('toggleAllCb');
  var batchDeleteBtn = $('batchDeleteBtn');
  var masterToggle = $('masterToggle');
  var masterToggleText = $('masterToggleText');
  var groupInput = $('groupInput');
  var groupDropBtn = $('groupDropBtn');
  var groupDropdown = $('groupDropdown');
  var addGroupBtn = $('addGroupBtn');

  // Network
  var requestBody = $('requestBody');
  var emptyState = $('emptyState');
  var countBadge = $('countBadge');
  var clearBtn = $('clearBtn');
  var detailEmpty = $('detailEmpty');
  var detailContent = $('detailContent');
  var copyDetailUrlBtn = $('copyDetailUrlBtn');
  var importReplayBtn = $('importReplayBtn');
  var importMockBtn = $('importMockBtn');
  var importCookiesBtn = $('importCookiesBtn');
  var importBeaconBtn = $('importBeaconBtn');
  var floatingImportMenu = $('floatingImportMenu');
  var sendReplayBtn = $('sendReplayBtn');
  var replayMethod = $('replayMethod');
  var replayUrl = $('replayUrl');
  var replayHeaders = $('replayHeaders');
  var replayBody = $('replayBody');
  var replayStatus = $('replayStatus');
  var copyCurlBtn = $('copyCurlBtn');
  var saveReplayBtn = $('saveReplayBtn');
  var formatReplayJsonBtn = $('formatReplayJsonBtn');
  var minifyReplayJsonBtn = $('minifyReplayJsonBtn');
  var replayHistoryList = $('replayHistoryList');
  var replayHistoryToggleAll = $('replayHistoryToggleAll');
  var replayGroupInput = $('replayGroupInput');
  var replayGroupDropBtn = $('replayGroupDropBtn');
  var replayGroupDropdown = $('replayGroupDropdown');
  var addReplayGroupBtn = $('addReplayGroupBtn');
  var replayHistorySearchInput = $('replayHistorySearchInput');
  var replayBatchDeleteBtn = $('replayBatchDeleteBtn');
  var replayPanelDivider = $('replayPanelDivider');
  var replayEmpty = $('replayEmpty');
  var replayContent = $('replayContent');
  var replaySourceText = $('replaySourceText');
  var replayResultStatus = $('replayResultStatus');
  var replayResultTime = $('replayResultTime');
  var replayResultContentType = $('replayResultContentType');
  var replayResultHeaders = $('replayResultHeaders');
  var replayResultBody = $('replayResultBody');
  var replayFindInput = $('replayFindInput');
  var replayFindCount = $('replayFindCount');
  var replayFindPrev = $('replayFindPrev');
  var replayFindNext = $('replayFindNext');
  var replayFindClose = $('replayFindClose');
  var timeTooltip = $('timeTooltip');
  var ctxMenu = $('contextMenu');
  var networkSearchInput = $('networkSearchInput');
  var filterBar = $('filterBar');
  var layout = document.querySelector('.layout');
  var listPanel = document.querySelector('.list-panel');
  var panelDivider = $('panelDivider');
  var detailPanel = document.querySelector('.detail-panel');
  var beaconList = $('beaconList');
  var beaconEmpty = $('beaconEmpty');
  var beaconCountBadge = $('beaconCountBadge');
  var beaconPathInput = $('beaconPathInput');
  var beaconConditions = $('beaconConditions');
  var beaconConditionSummary = $('beaconConditionSummary');
  var toggleBeaconConditionsBtn = $('toggleBeaconConditionsBtn');
  var addBeaconConditionBtn = $('addBeaconConditionBtn');
  var beaconEnabled = $('beaconEnabled');
  var clearBeaconBtn = $('clearBeaconBtn');
  var beaconDetailEmpty = $('beaconDetailEmpty');
  var beaconDetailContent = $('beaconDetailContent');
  var copyBeaconUrlBtn = $('copyBeaconUrlBtn');
  var copyBeaconPayloadBtn = $('copyBeaconPayloadBtn');
  var cookiesList = $('cookiesList');
  var cookiesEmpty = $('cookiesEmpty');
  var cookiesCountBadge = $('cookiesCountBadge');
  var clearCookiesBtn = $('clearCookiesBtn');
  var cookiesDetailEmpty = $('cookiesDetailEmpty');
  var cookiesDetailContent = $('cookiesDetailContent');
  var copyCookiesHeaderBtn = $('copyCookiesHeaderBtn');
  var copyCookiesSetBtn = $('copyCookiesSetBtn');
  var deleteCookiesEntryBtn = $('deleteCookiesEntryBtn');
  var throttleList = $('throttleList');
  var throttleEmpty = $('throttleEmpty');
  var throttleTabStatusDot = $('throttleTabStatusDot');
  var throttleStatusBadge = $('throttleStatusBadge');
  var addThrottleBtn = $('addThrottleBtn');
  var clearThrottleBtn = $('clearThrottleBtn');
  var throttleDetailEmpty = $('throttleDetailEmpty');
  var throttleDetailContent = $('throttleDetailContent');
  var throttleDetailName = $('throttleDetailName');
  var throttleDetailLatency = $('throttleDetailLatency');
  var throttleDetailJitter = $('throttleDetailJitter');
  var throttleDetailDown = $('throttleDetailDown');
  var throttleDetailUp = $('throttleDetailUp');
  var throttleDetailScopes = $('throttleDetailScopes');
  var throttleDetailStatus = $('throttleDetailStatus');
  var throttleDetailPreview = $('throttleDetailPreview');
  var throttleScopeReplay = $('throttleScopeReplay');
  var throttleScopeMock = $('throttleScopeMock');
  var throttleScopePage = $('throttleScopePage');
  var applyThrottleBtn = $('applyThrottleBtn');
  var editThrottleBtn = $('editThrottleBtn');
  var deleteThrottleBtn = $('deleteThrottleBtn');
  var configModalOverlay = $('configModalOverlay');
  var configModalTitle = $('configModalTitle');
  var configModalBody = $('configModalBody');
  var configModalCloseBtn = $('configModalCloseBtn');
  var configModalCancelBtn = $('configModalCancelBtn');
  var configModalSaveBtn = $('configModalSaveBtn');

  // Modal
  var modalOverlay = $('modalOverlay');
  var modalTitle = $('modalTitle');
  var modalCloseBtn = $('modalCloseBtn');
  var cancelModalBtn = $('cancelModalBtn');
  var saveRuleBtn = $('saveRuleBtn');
  var deleteRuleBtn = $('deleteRuleBtn');
  var ruleName = $('ruleName');
  var urlPattern = $('urlPattern');
  var responseBody = $('responseBody');
  var formatJsonBtn = $('formatJsonBtn');
  var findInput = $('findInput');
  var findResult = $('findResult');
  var findPrevBtn = $('findPrevBtn');
  var findNextBtn = $('findNextBtn');

  // Toast
  var toast = $('toast');
  var splitDrag = null;
  var replaySplitDrag = null;
  var replayRequestId = null;
  var replayHistory = [];
  var replayFindMatches = [];
  var replayFindIdx = -1;
  var modalFindMatches = [];
  var modalFindIdx = -1;
  var cookieEntries = [];
  var selectedCookieEntryId = null;
  var importMenuReqId = '';
  var beaconConfig = {
    path: '',
    conditions: [],
    enabled: true
  };
  var selectedBeaconId = '';
  var beaconConditionsExpanded = false;
  var throttleProfiles = [];
  var selectedThrottleId = '';
  var activeThrottleProfileId = '';
  var configModalMode = '';
  var configEditingId = '';

  // ======================================================================
  // TAB SWITCHING
  // ======================================================================
  tabNav.addEventListener('click', function(e) {
    var btn = e.target.closest('.tab');
    if (!btn) return;
    activateTab(btn.dataset.tab);
  });

  function activateTab(tab) {
    document.querySelectorAll('.tab').forEach(function(t) {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    tabMock.classList.toggle('active', tab === 'mock');
    tabNetwork.classList.toggle('active', tab === 'network');
    if (tabBeacon) tabBeacon.classList.toggle('active', tab === 'beacon');
    if (tabThrottle) tabThrottle.classList.toggle('active', tab === 'throttle');
    if (tabCookies) tabCookies.classList.toggle('active', tab === 'cookies');
    if (tabReplay) tabReplay.classList.toggle('active', tab === 'replay');
    if (tab === 'mock') loadRules();
    if (tab === 'network') {
      syncImportedState();
      renderNetworkList();
      refreshDetailImportState();
    }
    if (tab === 'beacon') renderBeaconTab();
    if (tab === 'throttle') renderThrottleTab();
    if (tab === 'cookies') renderCookiesTab();
    if (tab === 'replay') renderReplayTab();
  }

  // ======================================================================
  // NETWORK LAYOUT RESIZE
  // ======================================================================

  function applyPanelSplit(percent) {
    if (!listPanel || !detailPanel || !layout) return;
    var next = Math.max(25, Math.min(75, percent));
    listPanel.style.width = next + '%';
    detailPanel.style.width = (100 - next) + '%';
    try { localStorage.setItem('apiStudioNetworkSplit', String(next)); } catch(e) {}
  }

  function restorePanelSplit() {
    try {
      var saved = Number(localStorage.getItem('apiStudioNetworkSplit'));
      if (!saved) return;
      applyPanelSplit(saved);
    } catch(e) {}
  }

  if (panelDivider && layout) {
    panelDivider.addEventListener('mousedown', function(e) {
      e.preventDefault();
      var rect = layout.getBoundingClientRect();
      splitDrag = {
        left: rect.left,
        width: rect.width
      };
      panelDivider.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function(e) {
      if (!splitDrag) return;
      var offset = e.clientX - splitDrag.left;
      var percent = (offset / splitDrag.width) * 100;
      applyPanelSplit(percent);
    });

    document.addEventListener('mouseup', function() {
      if (!splitDrag) return;
      splitDrag = null;
      panelDivider.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });
  }

  // ======================================================================
  // REPLAY LAYOUT RESIZE
  // ======================================================================

  function getReplayWorkspace() {
    return document.querySelector('.replay-workspace');
  }

  function applyReplaySplit(widthPx) {
    var workspace = getReplayWorkspace();
    if (!workspace) return;
    var rect = workspace.getBoundingClientRect();
    var max = Math.max(360, rect.width - 420);
    var next = Math.max(260, Math.min(max, Number(widthPx) || 360));
    workspace.style.setProperty('--replay-left-width', next + 'px');
    try { localStorage.setItem('apiStudioReplaySplit', String(next)); } catch(e) {}
  }

  function restoreReplaySplit() {
    try {
      var saved = Number(localStorage.getItem('apiStudioReplaySplit'));
      if (saved) applyReplaySplit(saved);
    } catch(e) {}
  }

  if (replayPanelDivider) {
    replayPanelDivider.addEventListener('mousedown', function(e) {
      var workspace = getReplayWorkspace();
      if (!workspace) return;
      e.preventDefault();
      var rect = workspace.getBoundingClientRect();
      var current = parseFloat(getComputedStyle(workspace).getPropertyValue('--replay-left-width')) || 360;
      replaySplitDrag = {
        startX: e.clientX,
        startWidth: current,
        workspaceWidth: rect.width
      };
      replayPanelDivider.classList.add('dragging');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function(e) {
      if (!replaySplitDrag) return;
      applyReplaySplit(replaySplitDrag.startWidth + e.clientX - replaySplitDrag.startX);
    });

    document.addEventListener('mouseup', function() {
      if (!replaySplitDrag) return;
      replaySplitDrag = null;
      replayPanelDivider.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    });
  }

  // ======================================================================
  // MOCK TAB — RULE MANAGEMENT
  // ======================================================================

  function loadRules() {
    loadHits();
    chrome.runtime.sendMessage({ type: 'GET_ALL_RULES' }, function(resp) {
      rules = (resp && resp.rules) || [];
      loadMockGroups(renderRules);
    });
  }

  function loadMockGroups(done) {
    chrome.storage.local.get(['mockGroups', 'activeMockGroup'], function(result) {
      var storedGroups = Array.isArray(result.mockGroups) ? result.mockGroups : [];
      groups = uniqueGroups([DEFAULT_GROUP].concat(storedGroups).concat(groupsFromRules(rules)));
      activeGroup = result.activeMockGroup || activeGroup || DEFAULT_GROUP;
      if (groups.indexOf(activeGroup) === -1) activeGroup = DEFAULT_GROUP;
      syncGroupInput();
      renderGroupDropdown();
      persistMockGroups(false);
      if (typeof done === 'function') done();
    });
  }

  function loadHits() {
    chrome.storage.local.get('ruleHits', function(result) {
      ruleHits = result.ruleHits || {};
      updateHitSummary();
      renderRules();
    });
  }

  function renderRules() {
    mockList.innerHTML = '';
    updateHitSummary();
    var ruleIdMap = {};
    rules.forEach(function(rule) {
      rule.group = normalizeGroup(rule.group);
      if (rule.group === activeGroup) ruleIdMap[rule.id] = true;
    });
    Object.keys(selectedRuleIds).forEach(function(ruleId) {
      if (!ruleIdMap[ruleId]) delete selectedRuleIds[ruleId];
    });
    var visibleRules = rules.filter(function(rule) {
      return normalizeGroup(rule.group) === activeGroup;
    });
    var enabled = visibleRules.filter(function(r) { return r.enabled; }).length;
    var statsText = activeGroup + '：共 ' + visibleRules.length + ' 条规则，' + enabled + ' 条启用';
    mockStats.textContent = visibleRules.length + ' 条规则，' + enabled + ' 条启用';
    mockStats.title = statsText;
    syncBatchState();

    if (visibleRules.length === 0) {
      mockList.appendChild(mockEmpty);
      mockEmpty.textContent = rules.length === 0 ? '暂无 Mock 规则' : '当前分组暂无规则';
      return;
    }
    if (mockEmpty.parentNode) mockEmpty.remove();

    visibleRules.forEach(function(rule) {
      var item = document.createElement('div');
      item.className = 'mock-item' + (rule.enabled ? '' : ' disabled') + (selectedRuleIds[rule.id] ? ' batch-selected' : '');
      item.dataset.ruleId = rule.id;
      var m = rule.method || 'ANY';
      var urlInfo = (rule.url && rule.url.pattern) || '';
      var hits = ruleHits[rule.id] || 0;

      item.innerHTML =
        '<label class="mock-select" data-stop="1" title="选择规则">' +
          '<input type="checkbox" ' + (selectedRuleIds[rule.id] ? 'checked' : '') + '>' +
        '</label>' +
        '<div class="mock-toggle" data-stop="1">' +
          '<label class="toggle"><input type="checkbox" ' + (rule.enabled ? 'checked' : '') + '><span class="toggle-slider"></span></label>' +
        '</div>' +
        '<div class="mock-info">' +
          '<div class="mock-name">' + escHtml(rule.name || '未命名') + '</div>' +
          '<div class="mock-meta">' +
            '<span class="mock-method ' + m + '">' + m + '</span>' +
            '<span class="mock-url">' + escHtml(truncateUrl(urlInfo)) + '</span>' +
            '<span class="mock-hits' + (hits > 0 ? ' active' : '') + '" title="命中次数"><span class="mock-hit-number">' + hits + '</span><span class="mock-hit-icon" aria-hidden="true">🔥</span></span>' +
          '</div>' +
        '</div>' +
        '<div class="mock-actions">' +
          '<button class="mock-action-link" data-action="edit" data-stop="1" title="编辑">编辑</button>' +
          '<button class="mock-action-link" data-action="copy" data-stop="1" title="复制">复制</button>' +
          '<button class="mock-action-link" data-action="move" data-stop="1" title="转移到其他分组">转移</button>' +
          '<button class="mock-action-link danger" data-action="delete" data-stop="1" title="删除">删除</button>' +
        '</div>';

      // Toggle
      item.querySelector('.toggle input').addEventListener('change', function(e) {
        e.stopPropagation();
        chrome.runtime.sendMessage({ type: 'TOGGLE_RULE', ruleId: rule.id, enabled: this.checked }, loadRules);
      });

      item.querySelector('.mock-select input').addEventListener('change', function(e) {
        e.stopPropagation();
        if (this.checked) selectedRuleIds[rule.id] = true;
        else delete selectedRuleIds[rule.id];
        renderRules();
      });

      // Click → edit
      item.addEventListener('click', function(e) {
        if (e.target.closest('[data-stop]')) return;
        openEditModal(rule.id);
      });

      // Edit button
      item.querySelector('[data-action="edit"]').addEventListener('click', function(e) {
        e.stopPropagation();
        openEditModal(rule.id);
      });

      item.querySelector('[data-action="copy"]').addEventListener('click', function(e) {
        e.stopPropagation();
        duplicateRule(rule);
      });

      item.querySelector('[data-action="move"]').addEventListener('click', function(e) {
        e.stopPropagation();
        moveRuleToGroup(rule);
      });

      // Delete button
      item.querySelector('[data-action="delete"]').addEventListener('click', async function(e) {
        e.stopPropagation();
        if (await appConfirm('删除规则', '删除规则「' + (rule.name || '未命名') + '」？', '删除')) deleteRule(rule.id);
      });

      mockList.appendChild(item);
    });
    syncBatchState();
  }

  function renderHitSummary() {
    if (totalHitsCount) {
      totalHitsCount.textContent = totalHits > 0 ? totalHits + ' 🔥' : '';
      totalHitsCount.classList.toggle('show', totalHits > 0);
    }
  }

  function updateMockTabStatus(enabled) {
    if (mockTabStatusDot) mockTabStatusDot.classList.toggle('show', !!enabled);
  }

  function updateHitSummary() {
    var liveIds = {};
    rules.forEach(function(rule) {
      if (rule && rule.id) liveIds[rule.id] = true;
    });
    totalHits = Object.keys(ruleHits || {}).reduce(function(sum, ruleId) {
      return liveIds[ruleId] ? sum + (Number(ruleHits[ruleId]) || 0) : sum;
    }, 0);
    renderHitSummary();
  }

  function normalizeGroup(name) {
    var value = String(name || '').trim();
    return value || DEFAULT_GROUP;
  }

  function uniqueGroups(list) {
    var seen = {};
    var next = [];
    list.forEach(function(name) {
      var group = normalizeGroup(name);
      if (seen[group]) return;
      seen[group] = true;
      next.push(group);
    });
    if (next.indexOf(DEFAULT_GROUP) === -1) next.unshift(DEFAULT_GROUP);
    return next;
  }

  function groupsFromRules(list) {
    return (list || []).map(function(rule) {
      return normalizeGroup(rule.group);
    });
  }

  function persistMockGroups(shouldRender) {
    chrome.storage.local.set({
      mockGroups: groups,
      activeMockGroup: activeGroup
    }, function() {
      if (shouldRender) renderRules();
    });
  }

  function syncGroupInput() {
    if (groupInput) {
      groupInput.value = activeGroup;
      groupInput.title = activeGroup;
    }
  }

  function getFilteredGroups() {
    var query = groupInput ? groupInput.value.trim().toLowerCase() : '';
    if (!query || query === activeGroup.toLowerCase()) return groups;
    return groups.filter(function(group) {
      return group.toLowerCase().indexOf(query) !== -1;
    });
  }

  function renderGroupDropdown() {
    if (!groupDropdown) return;
    var filtered = getFilteredGroups();
    if (filtered.length === 0) {
      groupDropdown.innerHTML = '<div class="g-empty">没有匹配的分组</div>';
      return;
    }
    groupDropdown.innerHTML = filtered.map(function(group) {
      return '<div class="g-item' + (group === activeGroup ? ' active' : '') + '" data-group="' + escAttr(group) + '" title="' + escAttr(group) + '">' +
        '<span class="g-name">' + escHtml(group) + '</span>' +
        (group === DEFAULT_GROUP ? '' : '<span class="g-actions"><button class="g-act g-act-del" data-action="delete-group" title="删除分组" type="button">删除</button></span>') +
      '</div>';
    }).join('');
  }

  function openGroupDropdown() {
    if (!groupDropdown || !groupInput) return;
    renderGroupDropdown();
    var rect = groupInput.getBoundingClientRect();
    groupDropdown.style.left = rect.left + 'px';
    groupDropdown.style.top = (rect.bottom + 4) + 'px';
    groupDropdown.style.width = rect.width + 'px';
    groupDropdown.classList.add('show');
  }

  function closeGroupDropdown() {
    if (groupDropdown) groupDropdown.classList.remove('show');
  }

  function selectGroup(name) {
    activeGroup = normalizeGroup(name);
    if (groups.indexOf(activeGroup) === -1) groups.push(activeGroup);
    groups = uniqueGroups(groups);
    selectedRuleIds = {};
    syncGroupInput();
    renderGroupDropdown();
    closeGroupDropdown();
    persistMockGroups(true);
  }

  function createGroup(name) {
    var next = normalizeGroup(name);
    if (!next) return;
    selectGroup(next);
    showToast('已切换到分组：' + next);
  }

  function isComposingEvent(e) {
    return !!(e && (e.isComposing || e.keyCode === 229 || e.which === 229));
  }

  async function moveRuleToGroup(rule) {
    var currentGroup = normalizeGroup(rule.group);
    var targets = groups.filter(function(group) {
      return normalizeGroup(group) !== currentGroup;
    });
    if (targets.length === 0) {
      showToast('暂无其他已有分组可转移', 'error');
      return;
    }

    var target = await appSelect('转移分组', '选择要转移到的已有分组', targets);
    if (target === null) return;
    if (!target) {
      showToast('没有找到这个已有分组', 'error');
      return;
    }

    var nextRule = Object.assign({}, rule, { group: target });
    chrome.runtime.sendMessage({ type: 'SAVE_RULE', rule: nextRule }, function() {
      showToast('已转移到分组：' + target);
      loadRules();
    });
  }

  async function deleteGroup(name) {
    var group = normalizeGroup(name);
    if (group === DEFAULT_GROUP) {
      showToast('默认分组不能删除', 'error');
      return;
    }
    var ruleCount = rules.filter(function(rule) {
      return normalizeGroup(rule.group) === group;
    }).length;
    var message = ruleCount > 0
      ? '删除分组「' + group + '」？该分组下的 ' + ruleCount + ' 条规则会移动到默认分组。'
      : '删除分组「' + group + '」？';
    if (!await appConfirm('删除分组', message, '删除')) return;

    groups = groups.filter(function(item) {
      return normalizeGroup(item) !== group;
    });
    groups = uniqueGroups(groups);
    rules.forEach(function(rule) {
      if (normalizeGroup(rule.group) === group) rule.group = DEFAULT_GROUP;
    });
    if (activeGroup === group) activeGroup = DEFAULT_GROUP;
    selectedRuleIds = {};
    chrome.storage.local.set({
      rules: rules,
      mockGroups: groups,
      activeMockGroup: activeGroup
    }, function() {
      syncGroupInput();
      renderGroupDropdown();
      renderRules();
      showToast('分组已删除');
    });
  }

  function syncBatchState() {
    var selectedCount = Object.keys(selectedRuleIds).length;
    var visibleCount = rules.filter(function(rule) {
      return normalizeGroup(rule.group) === activeGroup;
    }).length;
    if (batchDeleteBtn) {
      batchDeleteBtn.classList.toggle('show', selectedCount > 0);
      batchDeleteBtn.textContent = selectedCount > 0 ? '🗑 删除 ' + selectedCount + ' 条' : '🗑 批量删除';
    }
    if (toggleAllCb) {
      toggleAllCb.checked = visibleCount > 0 && selectedCount === visibleCount;
      toggleAllCb.indeterminate = selectedCount > 0 && selectedCount < visibleCount;
    }
  }

  function openEditModal(ruleId) {
    var rule = rules.find(function(r) { return r.id === ruleId; });
    if (!rule) return;
    fillModal(rule);
    isEditMode = true;
    editingRule = rule;
    modalTitle.textContent = '编辑规则';
    deleteRuleBtn.style.display = 'block';
    showModal();
  }

  function openCreateModal() {
    resetForm();
    isEditMode = false;
    editingRule = null;
    modalTitle.textContent = '新建规则';
    deleteRuleBtn.style.display = 'none';
    showModal();
  }

  mockAddBtn.addEventListener('click', openCreateModal);

  if (groupInput) {
    groupInput.addEventListener('focus', openGroupDropdown);
    groupInput.addEventListener('input', function() {
      renderGroupDropdown();
      openGroupDropdown();
    });
    groupInput.addEventListener('keydown', function(e) {
      if (isComposingEvent(e)) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        createGroup(groupInput.value);
      }
      if (e.key === 'Escape') {
        syncGroupInput();
        closeGroupDropdown();
      }
    });
    groupInput.addEventListener('blur', function() {
      setTimeout(function() {
        if (!groupDropdown || !groupDropdown.classList.contains('show')) return;
        syncGroupInput();
        closeGroupDropdown();
      }, 120);
    });
  }

  if (groupDropBtn) {
    groupDropBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (groupDropdown && groupDropdown.classList.contains('show')) closeGroupDropdown();
      else openGroupDropdown();
    });
  }

  if (groupDropdown) {
    groupDropdown.addEventListener('mousedown', function(e) {
      e.preventDefault();
    });
    groupDropdown.addEventListener('click', function(e) {
      var action = e.target.closest('[data-action="delete-group"]');
      if (action) {
        e.preventDefault();
        e.stopPropagation();
        var actionItem = action.closest('.g-item');
        if (actionItem) deleteGroup(actionItem.dataset.group);
        return;
      }
      var item = e.target.closest('.g-item');
      if (!item) return;
      selectGroup(item.dataset.group);
    });
  }

  if (addGroupBtn) {
    addGroupBtn.addEventListener('click', async function() {
      var current = groupInput ? groupInput.value.trim() : '';
      var name = await appPrompt('新建分组', '请输入新分组名称', current && current !== activeGroup ? current : '');
      if (name === null) return;
      createGroup(name);
    });
  }

  document.addEventListener('click', function(e) {
    if (!groupDropdown || !groupDropdown.classList.contains('show')) return;
    if (e.target.closest('.group-select-wrap')) return;
    syncGroupInput();
    closeGroupDropdown();
  });

  // ======================================================================
  // MODAL
  // ======================================================================

  function resetForm() {
    clearModalFindHighlights();
    modalFindMatches = [];
    modalFindIdx = -1;
    if (findInput) findInput.value = '';
    if (findResult) findResult.textContent = '';
    ruleName.value = '';
    urlPattern.value = '';
    responseBody.value = '';
  }

  function fillModal(rule) {
    ruleName.value = rule.name || '';
    urlPattern.value = (rule.url && rule.url.pattern) || '';
    responseBody.value = (rule.response && rule.response.body) || '';
  }

  function showModal() { modalOverlay.classList.add('active'); }
  function hideModal() {
    clearModalFindHighlights();
    modalFindMatches = [];
    modalFindIdx = -1;
    if (findInput) findInput.value = '';
    if (findResult) findResult.textContent = '';
    modalOverlay.classList.remove('active');
  }

  modalCloseBtn.addEventListener('click', hideModal);
  cancelModalBtn.addEventListener('click', hideModal);
  modalOverlay.addEventListener('click', function(e) { if (e.target === this) hideModal(); });

  formatJsonBtn.addEventListener('click', function() {
    try { responseBody.value = JSON.stringify(JSON.parse(responseBody.value), null, 2); } catch(e) {}
    reFindModalIfNeeded();
  });

  if (findInput) {
    findInput.addEventListener('input', function() {
      doModalFind(this.value, { keepFindFocus: true });
    });
    findInput.addEventListener('keydown', function(e) {
      if (isComposingEvent(e)) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        navigateModalFind(e.shiftKey ? -1 : 1);
      }
      if (e.key === 'Escape') {
        findInput.value = '';
        doModalFind('');
      }
    });
  }

  if (findPrevBtn) {
    findPrevBtn.addEventListener('click', function() {
      navigateModalFind(-1);
    });
  }

  if (findNextBtn) {
    findNextBtn.addEventListener('click', function() {
      navigateModalFind(1);
    });
  }

  if (responseBody) {
    responseBody.addEventListener('input', reFindModalIfNeeded);
    responseBody.addEventListener('scroll', function() {
      syncFindTextControlScroll(responseBody);
    });
  }

  function doModalFind(text, options) {
    options = options || {};
    clearModalFindHighlights();
    modalFindMatches = [];
    modalFindIdx = -1;
    var query = String(text || '');
    if (!findResult) return;
    if (!query) {
      findResult.textContent = '';
      return;
    }
    var ranges = getTextMatchRanges(responseBody ? responseBody.value : '', query.toLowerCase());
    modalFindMatches = ranges.map(function(range, index) {
      return {
        el: responseBody,
        isTextControl: true,
        inputIndex: index,
        start: range.start,
        end: range.end
      };
    });
    if (modalFindMatches.length > 0) modalFindIdx = 0;
    renderFindTextControl(responseBody, ranges, modalFindIdx >= 0 ? modalFindMatches[modalFindIdx].inputIndex : -1);
    updateModalFindUI({ keepFindFocus: !!options.keepFindFocus });
    if (modalFindIdx >= 0 && !options.passive) scrollToModalFindMatch(modalFindIdx, { keepFindFocus: !!options.keepFindFocus });
  }

  function clearModalFindHighlights() {
    clearFindTextControl(responseBody);
  }

  function updateModalFindUI(options) {
    options = options || {};
    if (findResult) findResult.textContent = modalFindMatches.length ? ((modalFindIdx + 1) + '/' + modalFindMatches.length) : '0/0';
    renderFindTextControl(responseBody, (responseBody && responseBody.__replayFindRanges) || [], modalFindIdx >= 0 ? modalFindIdx : -1);
    if (!options.keepFindFocus && modalFindIdx >= 0) {
      var current = modalFindMatches[modalFindIdx];
      if (current) focusTextRange(current.el, current.start, current.end);
    }
  }

  function scrollToModalFindMatch(idx, options) {
    options = options || {};
    if (idx < 0 || idx >= modalFindMatches.length) return;
    modalFindIdx = idx;
    updateModalFindUI({ keepFindFocus: !!options.keepFindFocus });
    scrollTextControlToMatch(modalFindMatches[idx], { keepFindFocus: !!options.keepFindFocus, focusEl: findInput });
  }

  function navigateModalFind(direction) {
    if (!findInput || !findInput.value) return;
    if (modalFindMatches.length === 0) doModalFind(findInput.value, { passive: true, keepFindFocus: true });
    if (modalFindMatches.length === 0) return;
    modalFindIdx = direction < 0
      ? (modalFindIdx <= 0 ? modalFindMatches.length - 1 : modalFindIdx - 1)
      : (modalFindIdx >= modalFindMatches.length - 1 ? 0 : modalFindIdx + 1);
    scrollToModalFindMatch(modalFindIdx, { keepFindFocus: document.activeElement === findInput });
  }

  function reFindModalIfNeeded() {
    if (findInput && findInput.value) doModalFind(findInput.value, { passive: true, keepFindFocus: document.activeElement === findInput });
  }

  // Save rule
  saveRuleBtn.addEventListener('click', saveRule);

  function saveRule() {
    if (!urlPattern.value.trim()) {
      showToast('请输入 URL 路径', 'error');
      urlPattern.focus();
      return;
    }

    var body = responseBody.value.trim();
    if (body) { try { body = JSON.stringify(JSON.parse(body)); } catch(e) {} }

    var rule = {
      id: isEditMode ? editingRule.id : genId(),
      name: ruleName.value.trim() || '未命名规则',
      enabled: isEditMode ? editingRule.enabled : true,
      method: 'ANY',
      url: { pattern: toMockPathPattern(urlPattern.value), matchType: 'contains' },
      bodyMatch: {
        enabled: false,
        field: '',
        value: '',
        matchType: 'contains'
      },
      response: { statusCode: 200, headers: { 'Content-Type': 'application/json' }, body: body },
      delay: 0,
      createdAt: isEditMode ? editingRule.createdAt : Date.now(),
      group: isEditMode ? normalizeGroup(editingRule.group || activeGroup) : activeGroup
    };

    chrome.runtime.sendMessage({ type: 'SAVE_RULE', rule: rule }, function() {
      hideModal();
      loadRules();
      showToast('规则已保存');
    });
  }

  function deleteRule(ruleId) {
    chrome.runtime.sendMessage({ type: 'DELETE_RULE', ruleId: ruleId }, function() {
      delete selectedRuleIds[ruleId];
      if (editingRule && editingRule.id === ruleId) hideModal();
      loadRules();
    });
  }

  function duplicateRule(rule) {
    var copy = JSON.parse(JSON.stringify(rule));
    copy.id = genId();
    copy.name = (rule.name || '未命名规则') + ' 副本';
    copy.createdAt = Date.now();
    chrome.runtime.sendMessage({ type: 'SAVE_RULE', rule: copy }, function() {
      showToast('已复制规则');
      loadRules();
    });
  }

  deleteRuleBtn.addEventListener('click', async function() {
    if (editingRule && await appConfirm('删除规则', '删除规则「' + editingRule.name + '」？', '删除')) deleteRule(editingRule.id);
  });

  if (clearHitsBtn) {
    clearHitsBtn.addEventListener('click', function() {
      chrome.storage.local.set({ ruleHits: {} }, function() {
        ruleHits = {};
        totalHits = 0;
        renderHitSummary();
        renderRules();
        showToast('计数已清空');
      });
    });
  }

    if (toggleAllCb) {
      toggleAllCb.addEventListener('change', function() {
        selectedRuleIds = {};
        if (this.checked) {
        rules.forEach(function(rule) {
          if (normalizeGroup(rule.group) === activeGroup) selectedRuleIds[rule.id] = true;
        });
      }
      renderRules();
    });
  }

  if (batchDeleteBtn) {
    batchDeleteBtn.addEventListener('click', async function() {
      var ids = Object.keys(selectedRuleIds);
      if (ids.length === 0) return;
      if (!await appConfirm('批量删除', '确定删除选中的 ' + ids.length + ' 条规则？', '删除')) return;
      var deleteMap = {};
      ids.forEach(function(id) { deleteMap[id] = true; });
      chrome.runtime.sendMessage({ type: 'DELETE_RULES', ruleIds: ids }, function() {
        selectedRuleIds = {};
        if (editingRule && deleteMap[editingRule.id]) hideModal();
        loadRules();
        showToast('已删除 ' + ids.length + ' 条规则');
      });
    });
  }

  if (masterToggle) {
    masterToggle.addEventListener('change', function() {
      var enabled = !!this.checked;
      chrome.storage.local.set({ masterEnabled: enabled }, function() {
        if (masterToggleText) masterToggleText.textContent = enabled ? '开启' : '关闭';
        updateMockTabStatus(enabled);
        showToast(enabled ? 'Mock 已开启' : 'Mock 已关闭');
      });
    });
  }

  chrome.storage.onChanged.addListener(function(changes, areaName) {
    if (areaName !== 'local') return;
    var shouldRenderRules = false;
    if (changes.rules) {
      rules = changes.rules.newValue || [];
      groups = uniqueGroups(groups.concat(groupsFromRules(rules)));
      selectedRuleIds = {};
      shouldRenderRules = true;
      syncImportedState();
      syncStoredImportedState();
      renderNetworkList();
      refreshDetailImportState();
    }
    if (changes.mockGroups || changes.activeMockGroup) {
      if (changes.mockGroups) groups = uniqueGroups(changes.mockGroups.newValue || []);
      if (changes.activeMockGroup) activeGroup = normalizeGroup(changes.activeMockGroup.newValue);
      syncGroupInput();
      renderGroupDropdown();
      shouldRenderRules = true;
    }
    if (changes.ruleHits) {
      ruleHits = changes.ruleHits.newValue || {};
      updateHitSummary();
      shouldRenderRules = true;
    }
    if (changes.masterEnabled) {
      var masterEnabled = changes.masterEnabled.newValue !== false;
      if (masterToggle) masterToggle.checked = masterEnabled;
      if (masterToggleText) masterToggleText.textContent = masterEnabled ? '开启' : '关闭';
      updateMockTabStatus(masterEnabled);
    }
    if (changes.capturedRequests) {
      mergeCapturedMockRequests(changes.capturedRequests.newValue || []);
      renderNetworkList();
      updateBadge();
    }
    if (shouldRenderRules) renderRules();
  });

  // Keyboard shortcuts in modal
  document.addEventListener('keydown', function(e) {
    if (isComposingEvent(e)) return;
    if (e.key === 'Escape') hideModal();
    if (e.key === 'Enter' && modalOverlay.classList.contains('active') && e.target.tagName !== 'TEXTAREA') {
      if (e.target.closest('.modal')) { e.preventDefault(); saveRule(); }
    }
  });

  // ======================================================================
  // NETWORK TAB — CAPTURE REQUESTS
  // ======================================================================

  chrome.devtools.network.onRequestFinished.addListener(function(entry) {
    var id = 'req_' + Date.now() + '_' + random(6);
    var reqHeaders = (entry.request && entry.request.headers) || [];
    var resHeaders = (entry.response && entry.response.headers) || [];
    var reqHeaderObj = objHeaders(reqHeaders);
    var resHeaderObj = objHeaders(resHeaders);
    var responseContent = (entry.response && entry.response.content) || {};
    var totalTimeInfo = getEntryTotalTimeInfo(entry);
    var req = {
      id: id,
      url: entry.request ? entry.request.url : '',
      method: entry.request ? entry.request.method : 'GET',
      status: entry.response ? entry.response.status : 0,
      statusText: entry.response ? entry.response.statusText : '',
      totalTimeMs: totalTimeInfo.value,
      timeSource: totalTimeInfo.source,
      startedDateTime: entry.startedDateTime || '',
      headers: reqHeaderObj,
      resHeaders: resHeaderObj,
      cookies: extractRequestCookies(entry.request && entry.request.cookies, reqHeaderObj['cookie']),
      setCookies: extractResponseCookies(entry.response && entry.response.cookies, resHeaderObj['set-cookie']),
      postData: entry.request && entry.request.postData ? entry.request.postData.text : '',
      mimeType: responseContent.mimeType || '',
      responseContent: '',
      responseEncoding: '',
      responseBodyState: 'pending',
      responseBodyMessage: '',
      resourceType: requestType(entry),
      imported: false
    };

    entry.getContent(function(content, encoding) {
      req.responseContent = content || '';
      req.responseEncoding = encoding || '';
      applyResponseBodyState(req, content, encoding);
      saveToStorage(req);
      if (selectedId === req.id) showDetails(req.id);
      if (selectedBeaconId === req.id) renderBeaconTab();
    });

    requests.unshift(req);
    if (requests.length > 500) requests.length = 500;
    renderNetworkList();
    refreshBeaconForRequest(req);
    updateBadge();
  });

  function refreshBeaconForRequest(req) {
    if (!req || !beaconConfig.enabled || !beaconConfig.path) return;
    if (!isBeaconMatch(req)) return;
    selectedBeaconId = req.id;
    renderBeaconTab();
  }

  function saveToStorage(req) {
    chrome.storage.local.get('capturedRequests', function(result) {
      var list = result.capturedRequests || [];
      if (list.some(function(r) { return r.url === req.url && r.method === req.method; })) return;
      list.unshift({
        id: req.id, url: req.url, method: req.method, status: req.status,
        statusText: req.statusText, headers: req.headers, resHeaders: req.resHeaders,
        totalTimeMs: req.totalTimeMs, timeSource: req.timeSource || '', startedDateTime: req.startedDateTime,
        cookies: req.cookies, setCookies: req.setCookies, postData: req.postData || '',
        mimeType: req.mimeType, responseContent: req.responseContent,
        responseEncoding: req.responseEncoding || '',
        responseBodyState: req.responseBodyState || '',
        responseBodyMessage: req.responseBodyMessage || '',
        imported: !!req.imported, ruleId: req.ruleId || ''
      });
      if (list.length > 30) list.length = 30;
      chrome.storage.local.set({ capturedRequests: list });
    });
  }

  function mergeCapturedMockRequests(list) {
    (list || []).filter(function(item) {
      return item && item.mocked;
    }).forEach(function(item) {
      if (requests.some(function(req) { return req.id === item.id; })) return;
      var mimeType = item.mimeType || (item.resHeaders && (item.resHeaders['content-type'] || item.resHeaders['Content-Type'])) || '';
      var req = {
        id: item.id || ('mock_' + Date.now() + '_' + random(6)),
        url: item.url || '',
        method: item.method || 'GET',
        status: item.status || 200,
        statusText: item.statusText || 'Mocked',
        totalTimeMs: typeof item.totalTimeMs === 'number' ? item.totalTimeMs : (typeof item.time === 'number' ? item.time : 0),
        timeSource: item.timeSource || 'mock',
        startedDateTime: item.startedDateTime || new Date().toISOString(),
        headers: item.headers || {},
        resHeaders: item.resHeaders || {},
        cookies: item.cookies || [],
        setCookies: item.setCookies || [],
        postData: item.postData || '',
        mimeType: mimeType,
        responseContent: item.responseContent || '',
        responseEncoding: item.responseEncoding || '',
        responseBodyState: item.responseContent ? 'text' : 'empty',
        responseBodyMessage: item.responseContent ? '' : '(Mock 响应体为空)',
        resourceType: 'fetch',
        imported: !!item.imported,
        ruleId: item.ruleId || '',
        mocked: true
      };
      requests.unshift(req);
    });
    if (requests.length > 500) requests.length = 500;
  }

  function loadCapturedMockRequests() {
    chrome.storage.local.get('capturedRequests', function(result) {
      mergeCapturedMockRequests(result.capturedRequests || []);
      renderNetworkList();
      updateBadge();
    });
  }

  function renderNetworkList() {
    if (!requestBody) return;
    var visibleRequests = filteredRequests();
    emptyState.style.display = visibleRequests.length === 0 ? 'flex' : 'none';
    if (emptyState) {
      var hint = emptyState.querySelector('.hint');
      if (hint) hint.textContent = requests.length === 0 ? '刷新页面即可开始捕获网络请求' : '没有匹配当前过滤条件的请求';
    }
    requestBody.innerHTML = visibleRequests.map(function(r, index) {
      return '<tr class="' + (r.id === selectedId ? 'selected' : '') + '" data-id="' + r.id + '">' +
        '<td class="col-id">' + (index + 1) + '</td>' +
        '<td class="col-method"><span class="method ' + r.method.toUpperCase() + '">' + r.method + '</span></td>' +
        '<td class="col-url" title="' + escAttr(displayPath(r.url)) + '">' + escHtml(displayPathOnly(r.url)) + '</td>' +
        '<td class="col-action"><button class="imp-btn" data-id="' + r.id + '">导入</button></td>' +
        '</tr>';
    }).join('');
  }

  function syncImportedState() {
    var ruleIdMap = {};
    rules.forEach(function(rule) { ruleIdMap[rule.id] = true; });
    requests.forEach(function(req) {
      if (req.ruleId) {
        req.imported = !!ruleIdMap[req.ruleId];
        if (!req.imported) req.ruleId = '';
        return;
      }
      if (req.imported) {
        req.imported = hasImportedRuleForRequest(req);
      }
    });
  }

  function hasImportedRuleForRequest(req) {
    return rules.some(function(rule) {
      var method = rule.method || 'ANY';
      var pattern = rule.url && rule.url.pattern;
      return (method === 'ANY' || method === req.method) && pattern === req.url;
    });
  }

  function syncStoredImportedState() {
    var ruleIdMap = {};
    rules.forEach(function(rule) { ruleIdMap[rule.id] = true; });
    chrome.storage.local.get('capturedRequests', function(result) {
      var list = result.capturedRequests || [];
      var changed = false;
      list.forEach(function(item) {
        if (item.ruleId && item.imported && !ruleIdMap[item.ruleId]) {
          item.imported = false;
          item.ruleId = '';
          changed = true;
        } else if (!item.ruleId && item.imported && !hasImportedRuleForRequest(item)) {
          item.imported = false;
          changed = true;
        }
      });
      if (changed) chrome.storage.local.set({ capturedRequests: list });
    });
  }

  function updateBadge() {
    if (!countBadge) return;
    var visibleCount = filteredRequests().length;
    countBadge.textContent = visibleCount === requests.length ? requests.length + ' 个请求' : visibleCount + '/' + requests.length + ' 个请求';
  }

  // Network: click / right-click events
  if (requestBody) {
    requestBody.addEventListener('click', function(e) {
      var tr = e.target.closest('tr');
      var btn = e.target.closest('.imp-btn');
      if (!tr) return;
      var id = tr.dataset.id;
      if (btn) {
        e.stopPropagation();
        var req = findReq(id);
        if (req) openFloatingImportMenu(req, btn);
        return;
      }
      selectedId = id;
      renderNetworkList();
      showDetails(id);
    });

    requestBody.addEventListener('contextmenu', function(e) {
      var tr = e.target.closest('tr');
      if (!tr) return;
      e.preventDefault();
      var id = tr.dataset.id;
      if (!findReq(id) || findReq(id).imported) return;
      selectedId = id;
      renderNetworkList();
      showDetails(id);
      if (ctxMenu) {
        ctxMenu.style.display = 'block';
        ctxMenu.style.left = e.clientX + 'px';
        ctxMenu.style.top = e.clientY + 'px';
        ctxMenu.dataset.targetId = id;
      }
    });
  }

  if (detailContent) {
    detailContent.addEventListener('click', function(e) {
      var copyBtn = e.target.closest('.copy-resource-url');
      if (!copyBtn) return;
      e.preventDefault();
      copyTextValue(copyBtn.dataset.url || '', '资源地址已复制');
    });
  }

  if (copyDetailUrlBtn) {
    copyDetailUrlBtn.addEventListener('click', function() {
      var fullUrl = (($('detailUrlFull') || {}).textContent || '').trim();
      copyTextValue(fullUrl, '完整 URL 已复制');
    });
  }

  if (importReplayBtn) {
    importReplayBtn.addEventListener('click', function() {
      var req = findReq(selectedId);
      if (req) handleImportAction(req, 'replay');
    });
  }

  if (importMockBtn) {
    importMockBtn.addEventListener('click', function() {
      var req = findReq(selectedId);
      if (req) handleImportAction(req, 'mock');
    });
  }

  if (importCookiesBtn) {
    importCookiesBtn.addEventListener('click', function() {
      var req = findReq(selectedId);
      if (req) handleImportAction(req, 'cookies');
    });
  }

  if (importBeaconBtn) {
    importBeaconBtn.addEventListener('click', function() {
      var req = findReq(selectedId);
      if (req) handleImportAction(req, 'beacon');
    });
  }

  if (floatingImportMenu) {
    floatingImportMenu.addEventListener('click', function(e) {
      var item = e.target.closest('.import-menu-item');
      if (!item) return;
      var req = findReq(importMenuReqId);
      if (!req) return;
      handleImportAction(req, item.dataset.importTarget || '');
      hideAllImportMenus();
    });
  }

  document.addEventListener('click', function(e) {
    if (e.target.closest('.import-menu-wrap') || e.target.closest('#floatingImportMenu')) return;
    hideAllImportMenus();
  });

  if (throttleList) {
    throttleList.addEventListener('click', function(e) {
      var item = e.target.closest('[data-throttle-id]');
      if (!item) return;
      showThrottleProfile(item.dataset.throttleId);
    });
  }

  if (addThrottleBtn) addThrottleBtn.addEventListener('click', function() { showConfigModal('throttle'); });
  if (editThrottleBtn) editThrottleBtn.addEventListener('click', function() {
    var entry = throttleProfiles.find(function(item) { return item.id === selectedThrottleId; });
    if (entry) showConfigModal('throttle', entry);
  });
  if (deleteThrottleBtn) deleteThrottleBtn.addEventListener('click', async function() {
    if (!selectedThrottleId) return;
    var entry = throttleProfiles.find(function(item) { return item.id === selectedThrottleId; });
    if (!entry || !await appConfirm('删除弱网预设', '删除弱网预设「' + (entry.name || '未命名预设') + '」？', '删除')) return;
    throttleProfiles = throttleProfiles.filter(function(item) { return item.id !== selectedThrottleId; });
    if (activeThrottleProfileId === selectedThrottleId) activeThrottleProfileId = '';
    selectedThrottleId = '';
    persistThrottleProfiles();
    showToast('弱网预设已删除');
  });
  if (applyThrottleBtn) applyThrottleBtn.addEventListener('click', function() {
    if (!selectedThrottleId) return;
    activeThrottleProfileId = activeThrottleProfileId === selectedThrottleId ? '' : selectedThrottleId;
    persistThrottleProfiles();
    showToast(activeThrottleProfileId ? '弱网预设已启用' : '弱网预设已关闭');
  });
  [throttleScopeReplay, throttleScopeMock, throttleScopePage].forEach(function(input) {
    if (!input) return;
    input.addEventListener('change', updateSelectedThrottleScopes);
  });
  if (clearThrottleBtn) clearThrottleBtn.addEventListener('click', async function() {
    if (!throttleProfiles.length || !await appConfirm('清空弱网预设', '清空所有弱网预设？', '清空')) return;
    throttleProfiles = [];
    selectedThrottleId = '';
    activeThrottleProfileId = '';
    persistThrottleProfiles();
    showToast('弱网预设已清空');
  });
  if (configModalCloseBtn) configModalCloseBtn.addEventListener('click', hideConfigModal);
  if (configModalCancelBtn) configModalCancelBtn.addEventListener('click', hideConfigModal);
  if (configModalSaveBtn) configModalSaveBtn.addEventListener('click', saveConfigModal);
  if (configModalOverlay) configModalOverlay.addEventListener('click', function(e) {
    if (e.target === configModalOverlay) hideConfigModal();
  });

  // Context menu action
  if (ctxMenu) {
    ctxMenu.addEventListener('click', function() {
      var req = findReq(this.dataset.targetId);
      if (req && !req.imported) importRequest(req);
      this.style.display = 'none';
    });
    document.addEventListener('click', function(e) {
      if (!e.target.closest('#contextMenu') && ctxMenu) ctxMenu.style.display = 'none';
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      requests.length = 0;
      selectedId = null;
      replayRequestId = null;
      if (detailEmpty) detailEmpty.style.display = 'flex';
      if (detailContent) detailContent.style.display = 'none';
      renderNetworkList();
      renderBeaconTab();
      renderReplayTab();
      updateBadge();
      chrome.storage.local.set({ capturedRequests: [] });
    });
  }

  if (beaconList) {
    beaconList.addEventListener('click', function(e) {
      var deleteBtn = e.target.closest('[data-action="delete-beacon-match"]');
      if (deleteBtn) {
        e.stopPropagation();
        var deleteItem = deleteBtn.closest('[data-beacon-id]');
        if (deleteItem) deleteBeaconMatch(deleteItem.dataset.beaconId);
        return;
      }
      var item = e.target.closest('[data-beacon-id]');
      if (!item) return;
      selectedBeaconId = item.dataset.beaconId;
      renderBeaconTab();
    });
  }

  if (beaconPathInput) {
    beaconPathInput.addEventListener('input', function() {
      beaconConfig.path = beaconPathInput.value.trim();
      selectedBeaconId = '';
      persistBeaconConfig();
      renderBeaconTab();
    });
  }

  if (beaconConditions) {
    beaconConditions.addEventListener('input', function() {
      syncBeaconConditionsFromDom();
      selectedBeaconId = '';
      persistBeaconConfig();
      renderBeaconConditionSummary();
      renderBeaconTab();
    });
    beaconConditions.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-action="delete-beacon-condition"]');
      if (!btn) return;
      var row = btn.closest('.beacon-condition-row');
      if (row) row.remove();
      syncBeaconConditionsFromDom();
      ensureBeaconConditionRows();
      selectedBeaconId = '';
      persistBeaconConfig();
      renderBeaconConditionSummary();
      renderBeaconTab();
    });
  }

  if (toggleBeaconConditionsBtn) {
    toggleBeaconConditionsBtn.addEventListener('click', function() {
      beaconConditionsExpanded = !beaconConditionsExpanded;
      updateBeaconConditionVisibility();
    });
  }

  if (addBeaconConditionBtn) {
    addBeaconConditionBtn.addEventListener('click', function() {
      beaconConditionsExpanded = true;
      beaconConfig.conditions = getBeaconConditions().concat([{ field: '', contains: '' }]);
      renderBeaconConditionRows();
      persistBeaconConfig();
    });
  }

  if (beaconEnabled) {
    beaconEnabled.addEventListener('change', function() {
      beaconConfig.enabled = !!beaconEnabled.checked;
      persistBeaconConfig();
      renderBeaconTab();
    });
  }

  if (clearBeaconBtn) {
    clearBeaconBtn.addEventListener('click', function() {
      requests.length = 0;
      selectedId = null;
      selectedBeaconId = '';
      renderNetworkList();
      renderBeaconTab();
      updateBadge();
      chrome.storage.local.set({ capturedRequests: [] });
      showToast('埋点命中已清空');
    });
  }

  if (copyBeaconUrlBtn) {
    copyBeaconUrlBtn.addEventListener('click', function() {
      var match = findBeaconMatch(selectedBeaconId);
      copyTextValue(match ? match.req.url : '', '埋点 URL 已复制');
    });
  }

  if (copyBeaconPayloadBtn) {
    copyBeaconPayloadBtn.addEventListener('click', function() {
      var match = findBeaconMatch(selectedBeaconId);
      copyTextValue(match ? match.payloadText : '', '上报数据已复制');
    });
  }

  if (cookiesList) {
    cookiesList.addEventListener('click', function(e) {
      var item = e.target.closest('.cookies-item');
      if (!item) return;
      showCookieEntry(item.dataset.id);
    });
  }

  if (clearCookiesBtn) {
    clearCookiesBtn.addEventListener('click', function() {
      cookieEntries = [];
      selectedCookieEntryId = null;
      persistCookieEntries();
      renderCookiesTab();
      showToast('Cookies 已清空');
    });
  }

  if (copyCookiesHeaderBtn) {
    copyCookiesHeaderBtn.addEventListener('click', function() {
      var entry = cookieEntries.find(function(item) { return item.id === selectedCookieEntryId; });
      copyTextValue(formatCookieLines(entry && entry.cookies), 'Cookies 已复制');
    });
  }

  if (copyCookiesSetBtn) {
    copyCookiesSetBtn.addEventListener('click', function() {
      var entry = cookieEntries.find(function(item) { return item.id === selectedCookieEntryId; });
      copyTextValue(formatSetCookieLines(entry && entry.setCookies), 'Set-Cookie 已复制');
    });
  }

  if (deleteCookiesEntryBtn) {
    deleteCookiesEntryBtn.addEventListener('click', function() {
      if (!selectedCookieEntryId) return;
      cookieEntries = cookieEntries.filter(function(item) { return item.id !== selectedCookieEntryId; });
      selectedCookieEntryId = cookieEntries[0] ? cookieEntries[0].id : null;
      persistCookieEntries();
      renderCookiesTab();
      showToast('Cookies 记录已删除');
    });
  }

  if (networkSearchInput) {
    networkSearchInput.addEventListener('input', function() {
      networkSearchText = this.value;
      selectedId = null;
      if (detailEmpty) detailEmpty.style.display = 'flex';
      if (detailContent) detailContent.style.display = 'none';
      renderNetworkList();
      updateBadge();
    });
  }

  if (filterBar) {
    filterBar.addEventListener('click', function(e) {
      var chip = e.target.closest('.filter-chip');
      if (!chip) return;
      networkFilterType = chip.dataset.type || 'all';
      filterBar.querySelectorAll('.filter-chip').forEach(function(item) {
        item.classList.toggle('active', item === chip);
      });
      selectedId = null;
      if (detailEmpty) detailEmpty.style.display = 'flex';
      if (detailContent) detailContent.style.display = 'none';
      renderNetworkList();
      updateBadge();
    });
  }

  if (sendReplayBtn) {
    sendReplayBtn.addEventListener('click', resendSelectedRequest);
  }

  if (copyCurlBtn) {
    copyCurlBtn.addEventListener('click', copyReplayCurl);
  }

  if (saveReplayBtn) {
    saveReplayBtn.addEventListener('click', saveCurrentReplayRequest);
  }

  if (replayGroupInput) {
    replayGroupInput.addEventListener('focus', openReplayGroupDropdown);
    replayGroupInput.addEventListener('input', function() {
      renderReplayGroupDropdown();
      openReplayGroupDropdown();
    });
    replayGroupInput.addEventListener('keydown', function(e) {
      if (isComposingEvent(e)) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        createReplayGroup(replayGroupInput.value);
      }
      if (e.key === 'Escape') {
        syncReplayGroupInput();
        closeReplayGroupDropdown();
      }
    });
    replayGroupInput.addEventListener('blur', function() {
      setTimeout(function() {
        if (!replayGroupDropdown || !replayGroupDropdown.classList.contains('show')) return;
        syncReplayGroupInput();
        closeReplayGroupDropdown();
      }, 120);
    });
  }

  if (replayGroupDropBtn) {
    replayGroupDropBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      if (replayGroupDropdown && replayGroupDropdown.classList.contains('show')) closeReplayGroupDropdown();
      else openReplayGroupDropdown();
    });
  }

  if (replayGroupDropdown) {
    replayGroupDropdown.addEventListener('mousedown', function(e) {
      e.preventDefault();
    });
    replayGroupDropdown.addEventListener('click', function(e) {
      var action = e.target.closest('[data-action="delete-replay-group"]');
      if (action) {
        e.preventDefault();
        e.stopPropagation();
        var actionItem = action.closest('.g-item');
        if (actionItem) deleteReplayGroup(actionItem.dataset.group);
        return;
      }
      var item = e.target.closest('.g-item');
      if (!item) return;
      selectReplayGroup(item.dataset.group);
    });
  }

  if (addReplayGroupBtn) {
    addReplayGroupBtn.addEventListener('click', async function() {
      var current = replayGroupInput ? replayGroupInput.value.trim() : '';
      var name = await appPrompt('新建分组', '请输入新分组名称', current && current !== activeReplayGroup ? current : '');
      if (name === null) return;
      createReplayGroup(name);
    });
  }

  document.addEventListener('click', function(e) {
    if (!replayGroupDropdown || !replayGroupDropdown.classList.contains('show')) return;
    if (e.target.closest('.replay-group-select-wrap')) return;
    syncReplayGroupInput();
    closeReplayGroupDropdown();
  });

  if (replayHistorySearchInput) {
    replayHistorySearchInput.addEventListener('input', function() {
      replayHistorySearchText = this.value.trim().toLowerCase();
      selectedReplayHistoryIds = {};
      renderReplayHistory();
    });
  }

  if (formatReplayJsonBtn) {
    formatReplayJsonBtn.addEventListener('click', function() {
      formatReplayBody('pretty');
    });
  }

  if (minifyReplayJsonBtn) {
    minifyReplayJsonBtn.addEventListener('click', function() {
      formatReplayBody('minify');
    });
  }

  if (replayHistoryList) {
    replayHistoryList.addEventListener('click', function(e) {
      var actionBtn = e.target.closest('.replay-history-action');
      if (actionBtn) {
        e.stopPropagation();
        var historyId = actionBtn.dataset.historyId;
        if (actionBtn.dataset.action === 'rename') {
          renameReplayHistoryEntry(historyId);
        }
        if (actionBtn.dataset.action === 'move') {
          moveReplayHistoryToGroup(historyId);
        }
        if (actionBtn.dataset.action === 'delete') {
          deleteReplayHistoryEntry(historyId);
        }
        return;
      }
      var checkbox = e.target.closest('.replay-history-select input');
      if (checkbox) return;
      var btn = e.target.closest('.replay-history-item');
      if (!btn) return;
      applyReplayHistoryItem(btn.dataset.historyId);
    });
    replayHistoryList.addEventListener('change', function(e) {
      var checkbox = e.target.closest('.replay-history-select input');
      if (!checkbox) return;
      var historyId = checkbox.dataset.historyId;
      if (checkbox.checked) selectedReplayHistoryIds[historyId] = true;
      else delete selectedReplayHistoryIds[historyId];
      syncReplayHistorySelection();
    });
  }

  if (replayHistoryToggleAll) {
    replayHistoryToggleAll.addEventListener('change', function() {
      selectedReplayHistoryIds = {};
      if (this.checked) {
        getVisibleReplayHistory().forEach(function(item) { selectedReplayHistoryIds[item.id] = true; });
      }
      renderReplayHistory();
    });
  }

  if (replayBatchDeleteBtn) {
    replayBatchDeleteBtn.addEventListener('click', function() {
      var ids = Object.keys(selectedReplayHistoryIds);
      if (ids.length === 0) return;
      replayHistory = replayHistory.filter(function(item) { return !selectedReplayHistoryIds[item.id]; });
      selectedReplayHistoryIds = {};
      persistReplayHistory();
      renderReplayHistory();
      setReplayStatus('已删除 ' + ids.length + ' 条保存请求', 'success');
    });
  }

  if (replayFindInput) {
    replayFindInput.addEventListener('input', function() {
      doReplayFind(this.value, { keepFindFocus: true });
    });
    replayFindInput.addEventListener('keydown', function(e) {
      if (isComposingEvent(e)) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        navigateReplayFind(e.shiftKey ? -1 : 1);
      }
      if (e.key === 'Escape') {
        replayFindInput.value = '';
        doReplayFind('');
      }
    });
  }

  [replayMethod, replayUrl, replayHeaders, replayBody].forEach(function(field) {
    if (!field) return;
    field.addEventListener('input', reFindReplayIfNeeded);
    field.addEventListener('change', reFindReplayIfNeeded);
  });

  if (replayFindPrev) {
    replayFindPrev.addEventListener('click', function() {
      navigateReplayFind(-1);
    });
  }

  if (replayFindNext) {
    replayFindNext.addEventListener('click', function() {
      navigateReplayFind(1);
    });
  }

  if (replayFindClose) {
    replayFindClose.addEventListener('click', function() {
      if (replayFindInput) replayFindInput.value = '';
      doReplayFind('');
    });
  }

  function doImport(req) {
    if (!req || req.imported) return;
    importRequest(req);
  }

  function handleImportAction(req, target) {
    if (!req) return;
    var states = getImportStates(req);
    if (target === 'replay') {
      if (states.replay) {
        unstageReplayRequest(req);
        return;
      }
      stageReplayRequest(req);
      return;
    }
    if (target === 'mock') {
      if (states.mock) {
        unimportRequest(req);
        return;
      }
      doImport(req);
      return;
    }
    if (target === 'cookies') {
      if (states.cookies) {
        removeRequestCookies(req);
        return;
      }
      importRequestCookies(req);
      return;
    }
    if (target === 'beacon') {
      if (states.beacon) {
        unstageBeaconRequest(req);
        return;
      }
      stageBeaconRequest(req);
    }
  }

  function openFloatingImportMenu(req, anchor) {
    if (!floatingImportMenu || !anchor || !req) return;
    importMenuReqId = req.id;
    updateImportMenus(req);
    hideAllImportMenus();
    var rect = anchor.getBoundingClientRect();
    floatingImportMenu.style.display = 'block';
    var menuWidth = floatingImportMenu.offsetWidth || 160;
    var menuHeight = floatingImportMenu.offsetHeight || 120;
    var left = Math.min(window.innerWidth - menuWidth - 12, Math.max(12, rect.right - menuWidth));
    var top = Math.min(window.innerHeight - menuHeight - 12, rect.bottom + 8);
    floatingImportMenu.style.left = left + 'px';
    floatingImportMenu.style.top = top + 'px';
  }

  function hideAllImportMenus() {
    if (floatingImportMenu) floatingImportMenu.style.display = 'none';
  }

  // Show details
  function showDetails(id) {
    var req = findReq(id);
    if (!req) return;
    syncImportedState();

    if (detailEmpty) detailEmpty.style.display = 'none';
    if (detailContent) detailContent.style.display = 'block';

    renderDetailUrl(req.url);
    setText('detailMethod', req.method);
    var timeEl = $('detailTime');
    if (timeEl) {
      var sourceText = formatTimeSource(req.timeSource);
      if (req.totalTimeMs) {
        timeEl.innerHTML = escHtml(req.totalTimeMs + ' ms') +
          (sourceText && sourceText !== '-' ? '<span class="time-source-chip">' + escHtml(sourceText) + '</span>' : '') +
          '<span class="time-hint" data-time-source="' + escAttr(req.timeSource || '') + '">?</span>';
      } else {
        timeEl.textContent = '-';
      }
    }
    var st = req.status + (req.statusText ? ' ' + req.statusText : '');
    setText('detailStatus', st);
    var el = $('detailStatus');
    if (el) el.className = 'value ' + statusColor(req.status);

    var ct = req.resHeaders['content-type'] || req.mimeType || '-';
    setText('detailContentType', ct);
    setText('detailReqHeaders', formatHeaders(req.headers));
    setText('detailReqBody', req.postData || '无');
    setText('detailResHeaders', formatHeaders(req.resHeaders));

    renderResponseBody(req, ct);

    updateImportButton(req);
  }

  function importRequestCookies(req) {
    if (!req) return;
    var entry = {
      id: 'cookie_' + Date.now() + '_' + random(6),
      url: req.url || '',
      path: displayPath(req.url || ''),
      method: req.method || 'GET',
      sourceRequestId: req.id || '',
      timeText: formatDateTime(new Date()),
      cookies: req.cookies || [],
      setCookies: req.setCookies || []
    };
    cookieEntries.unshift(entry);
    if (cookieEntries.length > 100) cookieEntries.length = 100;
    selectedCookieEntryId = entry.id;
    persistCookieEntries();
    renderCookiesTab();
    refreshDetailImportState();
    showToast('Cookies 已导入');
  }

  function stageReplayRequest(req) {
    if (!req) return;
    replayRequestId = req.id;
    req.replayImported = true;
    renderReplayTab();
    refreshDetailImportState();
    setReplayStatus('请求已导入 Replay', 'success');
    showToast('已导入 Replay');
  }

  function unstageReplayRequest(req) {
    if (!req) return;
    req.replayImported = false;
    if (replayRequestId === req.id) {
      replayRequestId = null;
      renderReplayTab();
    }
    refreshDetailImportState();
    renderNetworkList();
    showToast('已取消导入 Replay');
  }

  function removeRequestCookies(req) {
    if (!req || !req.id) return;
    var before = cookieEntries.length;
    cookieEntries = cookieEntries.filter(function(entry) {
      return !(entry && entry.sourceRequestId === req.id);
    });
    if (selectedCookieEntryId && !cookieEntries.some(function(entry) { return entry.id === selectedCookieEntryId; })) {
      selectedCookieEntryId = cookieEntries[0] ? cookieEntries[0].id : null;
    }
    persistCookieEntries();
    renderCookiesTab();
    refreshDetailImportState();
    if (before !== cookieEntries.length) showToast('已取消导入 Cookies');
  }

  function stageBeaconRequest(req) {
    if (!req) return;
    beaconConfig.path = displayPath(req.url || '');
    beaconConfig.conditions = [];
    beaconConfig.enabled = true;
    selectedBeaconId = req.id || '';
    if (beaconPathInput) beaconPathInput.value = beaconConfig.path;
    renderBeaconConditionRows();
    if (beaconEnabled) beaconEnabled.checked = true;
    persistBeaconConfig();
    renderBeaconTab();
    refreshDetailImportState();
    showToast('已导入 Beacon');
  }

  function unstageBeaconRequest(req) {
    if (!req) return;
    beaconConfig.path = '';
    beaconConfig.conditions = [];
    selectedBeaconId = '';
    if (beaconPathInput) beaconPathInput.value = '';
    renderBeaconConditionRows();
    persistBeaconConfig();
    renderBeaconTab();
    refreshDetailImportState();
    showToast('已取消导入 Beacon');
  }

  function refreshDetailImportState() {
    if (!detailContent || detailContent.style.display === 'none') return;
    if (selectedId && findReq(selectedId)) {
      showDetails(selectedId);
      return;
    }
    var detailUrlEl = $('detailUrlFull');
    var detailMethodEl = $('detailMethod');
    if (!detailUrlEl || !detailMethodEl) return;
    var fallbackReq = {
      url: detailUrlEl.textContent || '',
      method: detailMethodEl.textContent || 'GET',
      imported: hasImportedRuleForRequest({
        url: detailUrlEl.textContent || '',
        method: detailMethodEl.textContent || 'GET'
      })
    };
    updateImportButton(fallbackReq);
  }

  function updateImportButton(req) {
    updateImportMenus(req);
  }

  function getImportStates(req) {
    if (!req) return { replay: false, mock: false, cookies: false, beacon: false };
    return {
      replay: !!req.replayImported,
      mock: !!req.imported,
      cookies: cookieEntries.some(function(entry) {
        return entry && entry.sourceRequestId && req.id && entry.sourceRequestId === req.id;
      }),
      beacon: isRequestStagedForBeacon(req)
    };
  }

  function isRequestStagedForBeacon(req) {
    if (!req || !req.url || !beaconConfig.path) return false;
    return beaconConfig.enabled !== false && beaconConfig.path === displayPath(req.url || '');
  }

  function updateImportMenus(req) {
    var states = getImportStates(req);
    if (importReplayBtn) {
      importReplayBtn.textContent = states.replay ? '已导入 Replay' : '导入 Replay';
      importReplayBtn.classList.toggle('imported', states.replay);
    }
    if (importMockBtn) {
      importMockBtn.textContent = states.mock ? '已导入 Mock' : '导入 Mock';
      importMockBtn.classList.toggle('imported', states.mock);
    }
    if (importCookiesBtn) {
      importCookiesBtn.textContent = states.cookies ? '已导入 Cookies' : '导入 Cookies';
      importCookiesBtn.classList.toggle('imported', states.cookies);
    }
    if (importBeaconBtn) {
      importBeaconBtn.textContent = states.beacon ? '已导入 Beacon' : '导入 Beacon';
      importBeaconBtn.classList.toggle('imported', states.beacon);
    }
    [floatingImportMenu].forEach(function(menu) {
      if (!menu) return;
      menu.querySelectorAll('.import-menu-item').forEach(function(item) {
        var target = item.dataset.importTarget || '';
        if (target === 'replay') item.textContent = states.replay ? '已导入 Replay' : '导入 Replay';
        if (target === 'mock') item.textContent = states.mock ? '已导入 Mock' : '导入 Mock';
        if (target === 'cookies') item.textContent = states.cookies ? '已导入 Cookies' : '导入 Cookies';
        if (target === 'beacon') item.textContent = states.beacon ? '已导入 Beacon' : '导入 Beacon';
      });
    });
  }

  function setText(id, text) {
    var el = $(id);
    if (el) el.textContent = text;
  }

  function renderDetailUrl(url) {
    var parts = splitUrlParts(url);
    setText('detailUrlOrigin', parts.origin || '-');
    setText('detailUrlPath', parts.path || '/');
    setText('detailUrlQuery', parts.queryDisplay || '(无参数)');
    setText('detailUrlFull', url || '');
    var queryEl = $('detailUrlQuery');
    if (queryEl) queryEl.title = parts.queryFull || '';
  }

  function splitUrlParts(url) {
    try {
      var u = new URL(url);
      var query = u.search ? u.search.slice(1) : '';
      return {
        origin: u.origin,
        path: u.pathname || '/',
        queryFull: query,
        queryDisplay: query ? truncateMiddle(query, 120) : '(无参数)'
      };
    } catch (e) {
      return {
        origin: url || '-',
        path: '',
        queryFull: '',
        queryDisplay: '(无参数)'
      };
    }
  }

  function renderResponseBody(req, mimeType) {
    var el = $('detailResBody');
    if (!el) return;
    var preview = buildMediaPreview(req, mimeType);
    if (preview) {
      el.classList.add('is-media');
      el.innerHTML = preview;
      return;
    }
    el.classList.remove('is-media');
    el.textContent = formatResponseBodyDisplay(req, mimeType);
  }

  function fillReplayEditor(req) {
    if (!req) return;
    if (replayMethod) replayMethod.value = (req.method || 'GET').toUpperCase();
    if (replayUrl) replayUrl.value = req.url || '';
    if (replayHeaders) replayHeaders.value = buildReplayHeadersText(req);
    if (replayBody) replayBody.value = req.postData || '';
  }

  function buildReplayHeadersText(req) {
    var headerText = formatHeaders((req && req.headers) || {}).replace('(无)', '');
    if (req && req.cookies && req.cookies.length && headerText.toLowerCase().indexOf('cookie:') === -1) {
      headerText = (headerText ? headerText + '\n' : '') + 'cookie: ' + buildCookieHeader(req.cookies);
    }
    return headerText;
  }

  function getReplayRequestDurationMs(req) {
    if (!req) return 0;
    return normalizeReplayDurationMs(req.lastReplayDurationMs || req.totalTimeMs || 0);
  }

  function renderReplayResult(req) {
    if (!req) {
      setText('replayResultStatus', '-');
      setText('replayResultTime', '-');
      setText('replayResultContentType', '-');
      setText('replayResultHeaders', '(尚未发送)');
      setText('replayResultBody', '(尚未发送)');
      return;
    }
    var ct = req.resHeaders['content-type'] || req.mimeType || '-';
    var st = req.status + (req.statusText ? ' ' + req.statusText : '');
    setText('replayResultStatus', st);
    var statusEl = $('replayResultStatus');
    if (statusEl) statusEl.className = 'value ' + statusColor(req.status);
    var durationMs = getReplayRequestDurationMs(req);
    setText('replayResultTime', durationMs ? durationMs + ' ms' : '-');
    setText('replayResultContentType', ct);
    setText('replayResultHeaders', formatHeaders(req.resHeaders));
    setText('replayResultBody', req.responseContent ? formatBody(req.responseContent, ct) : '(尚未发送)');
  }

  function renderReplayTab() {
    var req = replayRequestId ? findReq(replayRequestId) : null;
    if (!req) {
      replayRequestId = null;
      if (replayHistory.length === 0) {
        if (replayEmpty) replayEmpty.style.display = 'flex';
        if (replayContent) replayContent.style.display = 'none';
        renderReplayResult(null);
        setReplayStatus('');
        return;
      }
      if (replayEmpty) replayEmpty.style.display = 'none';
      if (replayContent) replayContent.style.display = 'flex';
      var firstHistory = getVisibleReplayHistory()[0];
      if (firstHistory) {
        if (replayMethod) replayMethod.value = firstHistory.method || 'GET';
        if (replayUrl) replayUrl.value = firstHistory.url || '';
        if (replayHeaders) replayHeaders.value = firstHistory.headersText || '';
        if (replayBody) replayBody.value = firstHistory.body || '';
        setText('replaySourceText', (firstHistory.method || 'GET') + ' ' + displayPath(firstHistory.url || ''));
      } else {
        setText('replaySourceText', activeReplayGroup || DEFAULT_REPLAY_GROUP);
      }
      renderReplayResult(null);
      renderReplayHistory();
      setReplayStatus('');
      updateReplayThrottleHint();
      return;
    }
    if (replayEmpty) replayEmpty.style.display = 'none';
    if (replayContent) replayContent.style.display = 'flex';
    fillReplayEditor(req);
    renderReplayResult(req);
    setText('replaySourceText', req.method + ' ' + displayPath(req.url));
    renderReplayHistory();
    updateReplayThrottleHint();
  }

  function openReplayWithRequest(req) {
    if (!req) return;
    stageReplayRequest(req);
  }

  function setReplayStatus(message, state) {
    if (!replayStatus) return;
    replayStatus.textContent = message || '';
    replayStatus.className = 'replay-status' + (state ? ' ' + state : '');
  }

  function getActiveThrottleProfile() {
    if (!activeThrottleProfileId) return null;
    var profile = throttleProfiles.find(function(item) { return item.id === activeThrottleProfileId; }) || null;
    return profile ? normalizeThrottleProfile(profile) : null;
  }

  function getActiveThrottleProfileForScope(scope) {
    var profile = getActiveThrottleProfile();
    if (!profile) return null;
    var scopes = normalizeThrottleScopes(profile.scopes);
    return scopes[scope] ? profile : null;
  }

  function updateReplayThrottleHint() {
    var active = getActiveThrottleProfileForScope('replay');
    if (!active) return;
    if (!replayStatus || replayStatus.textContent) return;
    setReplayStatus('当前弱网预设: ' + throttleSummaryText(active));
  }

  function throttleSummaryText(profile) {
    if (!profile) return '';
    return (profile.name || '未命名预设') +
      ' · 延迟 ' + (profile.latency || 0) + ' ms' +
      ((profile.jitterMs || 0) ? '±' + profile.jitterMs + ' ms' : '') +
      ' · 下行 ' + (profile.downloadKbps || 0) + ' kbps' +
      ' · 上行 ' + (profile.uploadKbps || 0) + ' kbps';
  }

  function applyThrottleBeforeFetch(profile, body) {
    if (!profile) return Promise.resolve();
    var roundTripDelay = Math.max(0, (Number(profile.latency) || 0) + randomJitter(profile.jitterMs));
    var delay = roundTripDelay;
    delay += transferDelayMs(body, profile.uploadKbps);
    return waitMs(delay);
  }

  function applyThrottleAfterFetch(profile, body) {
    if (!profile) return Promise.resolve();
    return waitMs(transferDelayMs(body, profile.downloadKbps));
  }

  function randomJitter(jitterMs) {
    jitterMs = Math.max(0, Number(jitterMs) || 0);
    if (!jitterMs) return 0;
    return Math.round((Math.random() * 2 - 1) * jitterMs);
  }

  function transferDelayMs(payload, kbps) {
    kbps = Number(kbps) || 0;
    if (!kbps || kbps <= 0) return 0;
    var bytes = payloadByteLength(payload);
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

  function parseHeadersText(text) {
    var headerObj = {};
    (text || '').split(/\r?\n/).forEach(function(line) {
      var raw = line.trim();
      if (!raw) return;
      var idx = raw.indexOf(':');
      if (idx <= 0) return;
      var key = raw.slice(0, idx).trim();
      var value = raw.slice(idx + 1).trim();
      if (key) headerObj[key] = value;
    });
    return headerObj;
  }

  function formatReplayBody(mode) {
    if (!replayBody || !replayBody.value.trim()) return;
    try {
      var parsed = JSON.parse(replayBody.value);
      replayBody.value = mode === 'minify' ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
      setReplayStatus(mode === 'minify' ? '请求体已压缩' : '请求体已格式化', 'success');
    } catch(e) {
      setReplayStatus('请求体不是有效 JSON', 'error');
    }
  }

  function buildCurlCommand(method, url, headers, body) {
    var parts = ['curl'];
    parts.push('-X');
    parts.push(shellEscape(method));
    Object.keys(headers || {}).forEach(function(key) {
      parts.push('-H');
      parts.push(shellEscape(key + ': ' + headers[key]));
    });
    if (body && method !== 'GET' && method !== 'HEAD') {
      parts.push('--data-raw');
      parts.push(shellEscape(body));
    }
    parts.push(shellEscape(url));
    return parts.join(' ');
  }

  function shellEscape(value) {
    return "'" + String(value || '').replace(/'/g, "'\"'\"'") + "'";
  }

  function copyReplayCurl() {
    var method = replayMethod && replayMethod.value ? replayMethod.value.toUpperCase() : 'GET';
    var url = replayUrl ? replayUrl.value.trim() : '';
    if (!url) {
      setReplayStatus('没有可复制的 URL', 'error');
      showToast('没有可复制的 URL', 'error');
      return;
    }
    var curl = buildCurlCommand(method, url, parseHeadersText(replayHeaders ? replayHeaders.value : ''), replayBody ? replayBody.value : '');
    navigator.clipboard.writeText(curl).then(function() {
      setReplayStatus('cURL 已复制', 'success');
      showToast('cURL 已复制');
    }).catch(function(error) {
      setReplayStatus('复制失败: ' + error.message, 'error');
      showToast('复制失败: ' + error.message, 'error');
    });
  }

  function loadReplayHistory() {
    try {
      replayHistory = JSON.parse(localStorage.getItem('apiStudioReplayHistory') || '[]');
      if (!Array.isArray(replayHistory)) replayHistory = [];
      var storedGroups = JSON.parse(localStorage.getItem('apiStudioReplayGroups') || '[]');
      replayGroups = Array.isArray(storedGroups) && storedGroups.length ? storedGroups : [DEFAULT_REPLAY_GROUP];
      replayHistory = replayHistory.map(function(item) {
        item = item || {};
        item.name = item.name || '';
        item.group = normalizeReplayGroup(item.group);
        if (replayGroups.indexOf(item.group) === -1) replayGroups.push(item.group);
        item.label = item.label || ((item.method || 'GET') + ' ' + displayPath(item.url || ''));
        item.fullLabel = item.fullLabel || ((item.method || 'GET') + ' ' + (item.url || ''));
        item.timeText = item.timeText || '';
        item.meta = item.meta || '';
        item.status = normalizeReplayStatus(item.status);
        item.statusText = item.statusText || '';
        item.totalTimeMs = normalizeReplayDurationMs(item.totalTimeMs || item.lastReplayDurationMs || 0);
        return item;
      });
      replayGroups = uniqueReplayGroups([DEFAULT_REPLAY_GROUP].concat(replayGroups).concat(replayGroupsFromHistory(replayHistory)));
      activeReplayGroup = normalizeReplayGroup(localStorage.getItem('apiStudioActiveReplayGroup') || DEFAULT_REPLAY_GROUP);
      if (replayGroups.indexOf(activeReplayGroup) === -1) activeReplayGroup = replayGroups[0] || DEFAULT_REPLAY_GROUP;
      persistReplayGroups();
    } catch(e) {
      replayHistory = [];
      replayGroups = [DEFAULT_REPLAY_GROUP];
      activeReplayGroup = DEFAULT_REPLAY_GROUP;
    }
  }

  function normalizeReplayGroup(name) {
    var value = String(name || '').trim();
    return value || DEFAULT_REPLAY_GROUP;
  }

  function uniqueReplayGroups(list) {
    var seen = {};
    var next = [];
    (list || []).forEach(function(name) {
      var group = normalizeReplayGroup(name);
      if (seen[group]) return;
      seen[group] = true;
      next.push(group);
    });
    if (next.indexOf(DEFAULT_REPLAY_GROUP) === -1) next.unshift(DEFAULT_REPLAY_GROUP);
    return next;
  }

  function replayGroupsFromHistory(list) {
    return (list || []).map(function(item) {
      return normalizeReplayGroup(item.group);
    });
  }

  function persistReplayGroups() {
    replayGroups = uniqueReplayGroups(replayGroups);
    try {
      localStorage.setItem('apiStudioReplayGroups', JSON.stringify(replayGroups));
      localStorage.setItem('apiStudioActiveReplayGroup', activeReplayGroup || DEFAULT_REPLAY_GROUP);
    } catch(e) {}
    syncReplayGroupInput();
    renderReplayGroupDropdown();
  }

  function syncReplayGroupInput() {
    if (replayGroupInput) {
      replayGroupInput.value = activeReplayGroup || DEFAULT_REPLAY_GROUP;
      replayGroupInput.title = activeReplayGroup || DEFAULT_REPLAY_GROUP;
    }
  }

  function getFilteredReplayGroups() {
    var query = replayGroupInput ? replayGroupInput.value.trim().toLowerCase() : '';
    if (!query || query === String(activeReplayGroup || '').toLowerCase()) return replayGroups;
    return replayGroups.filter(function(group) {
      return group.toLowerCase().indexOf(query) !== -1;
    });
  }

  function renderReplayGroupDropdown() {
    if (!replayGroupDropdown) return;
    var filtered = getFilteredReplayGroups();
    if (filtered.length === 0) {
      replayGroupDropdown.innerHTML = '<div class="g-empty">没有匹配的分组</div>';
      return;
    }
    replayGroupDropdown.innerHTML = filtered.map(function(group) {
      return '<div class="g-item' + (group === activeReplayGroup ? ' active' : '') + '" data-group="' + escAttr(group) + '" title="' + escAttr(group) + '">' +
        '<span class="g-name">' + escHtml(group) + '</span>' +
        (group === DEFAULT_REPLAY_GROUP ? '' : '<span class="g-actions"><button class="g-act g-act-del" data-action="delete-replay-group" title="删除分组" type="button">删除</button></span>') +
      '</div>';
    }).join('');
  }

  function openReplayGroupDropdown() {
    if (!replayGroupDropdown || !replayGroupInput) return;
    renderReplayGroupDropdown();
    var rect = replayGroupInput.getBoundingClientRect();
    replayGroupDropdown.style.left = rect.left + 'px';
    replayGroupDropdown.style.top = (rect.bottom + 4) + 'px';
    replayGroupDropdown.style.width = rect.width + 'px';
    replayGroupDropdown.classList.add('show');
  }

  function closeReplayGroupDropdown() {
    if (replayGroupDropdown) replayGroupDropdown.classList.remove('show');
  }

  function getVisibleReplayHistory() {
    return replayHistory.filter(function(item) {
      if (normalizeReplayGroup(item.group) !== activeReplayGroup) return false;
      return matchesReplayHistorySearch(item);
    });
  }

  function matchesReplayHistorySearch(item) {
    if (!replayHistorySearchText) return true;
    var name = String(item.name || item.label || '').toLowerCase();
    return name.indexOf(replayHistorySearchText) !== -1;
  }

  function selectReplayGroup(name) {
    activeReplayGroup = normalizeReplayGroup(name);
    if (replayGroups.indexOf(activeReplayGroup) === -1) replayGroups.push(activeReplayGroup);
    replayGroups = uniqueReplayGroups(replayGroups);
    selectedReplayHistoryIds = {};
    resetReplayHistorySearch();
    syncReplayGroupInput();
    renderReplayGroupDropdown();
    closeReplayGroupDropdown();
    persistReplayGroups();
    renderReplayHistory();
    loadFirstVisibleReplayHistory();
  }

  function createReplayGroup(name) {
    var next = normalizeReplayGroup(name);
    if (!next) return;
    selectReplayGroup(next);
    showToast('已切换到分组：' + next);
  }

  async function deleteReplayGroup(name) {
    var group = normalizeReplayGroup(name);
    if (group === DEFAULT_REPLAY_GROUP) {
      showToast('默认分组不能删除', 'error');
      return;
    }
    var itemCount = replayHistory.filter(function(item) {
      return normalizeReplayGroup(item.group) === group;
    }).length;
    var message = itemCount > 0
      ? '删除分组「' + group + '」？该分组下的 ' + itemCount + ' 条保存请求会移动到默认分组。'
      : '删除分组「' + group + '」？';
    if (!await appConfirm('删除分组', message, '删除')) return;

    replayGroups = replayGroups.filter(function(item) {
      return normalizeReplayGroup(item) !== group;
    });
    replayGroups = uniqueReplayGroups(replayGroups);
    replayHistory.forEach(function(item) {
      if (normalizeReplayGroup(item.group) === group) item.group = DEFAULT_REPLAY_GROUP;
    });
    if (activeReplayGroup === group) activeReplayGroup = DEFAULT_REPLAY_GROUP;
    selectedReplayHistoryIds = {};
    resetReplayHistorySearch();
    persistReplayGroups();
    persistReplayHistory();
    renderReplayHistory();
    loadFirstVisibleReplayHistory();
    showToast('分组已删除');
  }

  async function moveReplayHistoryToGroup(id) {
    var item = replayHistory.find(function(entry) { return entry.id === id; });
    if (!item) return;
    var currentGroup = normalizeReplayGroup(item.group);
    var targets = replayGroups.filter(function(group) {
      return normalizeReplayGroup(group) !== currentGroup;
    });
    if (targets.length === 0) {
      showToast('暂无其他已有分组可转移', 'error');
      return;
    }

    var target = await appSelect('转移分组', '选择要转移到的已有分组', targets);
    if (target === null) return;
    if (!target) {
      showToast('没有找到这个已有分组', 'error');
      return;
    }
    item.group = normalizeReplayGroup(target);
    delete selectedReplayHistoryIds[id];
    persistReplayHistory();
    renderReplayHistory();
    loadFirstVisibleReplayHistory();
    showToast('已转移到分组：' + item.group);
  }

  function resetReplayHistorySearch() {
    replayHistorySearchText = '';
    if (replayHistorySearchInput) replayHistorySearchInput.value = '';
  }

  function loadFirstVisibleReplayHistory() {
    var firstHistory = getVisibleReplayHistory()[0];
    if (firstHistory) {
      applyReplayHistoryItem(firstHistory.id);
      return;
    }
    setText('replaySourceText', activeReplayGroup || DEFAULT_REPLAY_GROUP);
  }

  function saveReplayHistoryEntry(entry) {
    replayHistory = replayHistory.filter(function(item) { return item.id !== entry.id; });
    replayHistory.unshift(entry);
    if (replayHistory.length > 100) replayHistory.length = 100;
    persistReplayHistory();
    renderReplayHistory();
  }

  function saveCurrentReplayRequest() {
    var method = replayMethod && replayMethod.value ? replayMethod.value.toUpperCase() : 'GET';
    var url = replayUrl ? replayUrl.value.trim() : '';
    var headersText = replayHeaders ? replayHeaders.value : '';
    var body = replayBody ? replayBody.value : '';
    if (!url) {
      setReplayStatus('没有可保存的 URL', 'error');
      showToast('没有可保存的 URL', 'error');
      return;
    }
    var existing = replayHistory.find(function(item) {
      return (item.group || DEFAULT_REPLAY_GROUP) === (activeReplayGroup || DEFAULT_REPLAY_GROUP) &&
        isReplayHistorySameRequest(item, method, url, headersText, body);
    });
    var sourceReq = getReplaySourceForCurrentForm(method, url, headersText, body);
    var sourceStatus = normalizeReplayStatus(sourceReq && sourceReq.status);
    var sourceDuration = getReplayRequestDurationMs(sourceReq);
    var requestLine = method + ' ' + displayPath(url);
    var defaultName = existing && existing.name ? existing.name : requestLine;
    appPrompt('保存请求', '给这个请求起个名字，之后左侧列表会显示这个名字。', defaultName).then(function(inputName) {
      if (inputName === null) return;
      var name = String(inputName || '').trim() || requestLine;
      saveReplayHistoryEntry({
        id: existing ? existing.id : 'saved_' + Date.now(),
        name: name,
        label: name,
        fullLabel: name + ' · ' + method + ' ' + url,
        meta: requestLine,
        timeText: formatDateTime(new Date()),
        group: activeReplayGroup || DEFAULT_REPLAY_GROUP,
        method: method,
        url: url,
        headersText: headersText,
        body: body,
        status: sourceStatus || (existing ? normalizeReplayStatus(existing.status) : 0),
        statusText: sourceReq ? (sourceReq.statusText || '') : ((existing && existing.statusText) || ''),
        totalTimeMs: sourceDuration || (existing ? normalizeReplayDurationMs(existing.totalTimeMs || existing.lastReplayDurationMs || 0) : 0)
      });
      setText('replaySourceText', requestLine);
      setReplayStatus(existing ? '保存请求已更新' : '请求已保存', 'success');
      showToast(existing ? '保存请求已更新' : '请求已保存');
    });
  }

  function persistReplayHistory() {
    try { localStorage.setItem('apiStudioReplayHistory', JSON.stringify(replayHistory)); } catch(e) {}
  }

  function renderReplayHistory() {
    if (!replayHistoryList) return;
    syncReplayGroupInput();
    var activeId = null;
    var selectedKeys = {};
    var visibleHistory = getVisibleReplayHistory();
    Object.keys(selectedReplayHistoryIds).forEach(function(id) { selectedKeys[id] = true; });
    if (visibleHistory.length === 0) {
      replayHistoryList.innerHTML = '<div class="replay-history-empty">' + (replayHistorySearchText ? '没有匹配的保存请求' : '这个分组还没有保存的请求') + '</div>';
      syncReplayHistorySelection();
      return;
    }
    if (replayMethod && replayUrl) {
      var currentMethod = replayMethod.value || 'GET';
      var currentUrl = replayUrl.value.trim();
      var currentHeaders = replayHeaders ? replayHeaders.value : '';
      var currentBody = replayBody ? replayBody.value : '';
      var activeItem = visibleHistory.find(function(item) {
        return isReplayHistorySameRequest(item, currentMethod, currentUrl, currentHeaders, currentBody);
      });
      activeId = activeItem ? activeItem.id : null;
    }
    replayHistoryList.innerHTML = visibleHistory.map(function(item, index) {
      var pathText = displayPath(item.url || '');
      var nameText = replayHistoryNameText(item);
      var displayNameText = truncateReplayHistoryName(nameText);
      return '<div class="replay-history-item' + (activeId === item.id ? ' active' : '') + (selectedKeys[item.id] ? ' batch-selected' : '') + '" data-history-id="' + escAttr(item.id) + '">' +
        '<div class="replay-history-side">' +
          '<label class="replay-history-select" title="选择"><input type="checkbox" data-history-id="' + escAttr(item.id) + '"' + (selectedKeys[item.id] ? ' checked' : '') + '></label>' +
          '<span class="replay-history-index">' + (index + 1) + '</span>' +
        '</div>' +
        '<div class="replay-history-main">' +
          '<div class="replay-history-path" title="' + escAttr(pathText || '-') + '">' + escHtml(pathText || '-') + '</div>' +
          '<div class="replay-history-meta-row">' +
            '<div class="replay-history-name" title="' + escAttr(nameText) + '">' + escHtml(displayNameText) + '</div>' +
            '<div class="replay-history-actions">' +
              '<button type="button" class="replay-history-action" data-action="rename" data-history-id="' + escAttr(item.id) + '" title="重命名">命名</button>' +
              '<button type="button" class="replay-history-action" data-action="move" data-history-id="' + escAttr(item.id) + '" title="转移分组">转移</button>' +
              '<button type="button" class="replay-history-action danger" data-action="delete" data-history-id="' + escAttr(item.id) + '" title="删除">删除</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    }).join('');
    syncReplayHistorySelection();
    reFindReplayIfNeeded();
  }

  function applyReplayHistoryItem(id) {
    var item = replayHistory.find(function(entry) { return entry.id === id; });
    if (!item) return;
    clearReplaySourceRequest();
    if (replayMethod) replayMethod.value = item.method || 'GET';
    if (replayUrl) replayUrl.value = item.url || '';
    if (replayHeaders) replayHeaders.value = item.headersText || '';
    if (replayBody) replayBody.value = item.body || '';
    setText('replaySourceText', (item.method || 'GET') + ' ' + displayPath(item.url || ''));
    renderReplayResult(null);
    if (replayHistoryList) {
      replayHistoryList.querySelectorAll('.replay-history-item').forEach(function(node) {
        node.classList.toggle('active', node.dataset.historyId === id);
      });
    }
    setReplayStatus('已载入保存请求', 'success');
  }

  function renameReplayHistoryEntry(id) {
    var item = replayHistory.find(function(entry) { return entry.id === id; });
    if (!item) return;
    var requestLine = (item.method || 'GET') + ' ' + displayPath(item.url || '');
    appPrompt('重命名保存请求', '给这个请求起个更好记的名字。', item.name || item.label || requestLine).then(function(inputName) {
      if (inputName === null) return;
      var name = String(inputName || '').trim() || requestLine;
      item.name = name;
      item.label = name;
      item.fullLabel = name + ' · ' + (item.method || 'GET') + ' ' + (item.url || '');
      item.meta = item.meta || requestLine;
      persistReplayHistory();
      renderReplayHistory();
      setReplayStatus('保存请求已重命名', 'success');
      showToast('保存请求已重命名');
    });
  }

  var replayFindTextControlIds = ['replayHeaders', 'replayBody'];

  function doReplayFind(text, options) {
    options = options || {};
    var passive = !!options.passive;
    var preserveIndex = typeof options.preserveIndex === 'number' ? options.preserveIndex : -1;
    clearReplayFindHighlights();
    replayFindMatches = [];
    replayFindIdx = -1;
    if (!replayFindCount) return;
    if (!text) {
      replayFindCount.textContent = '0/0';
      return;
    }

    var lower = String(text).toLowerCase();
    var re = new RegExp('(' + escapeRegExp(text) + ')', 'gi');
    [
      'replaySourceText',
      'replayMethod',
      'replayUrl',
      'replayHeaders',
      'replayBody',
      'replayResultStatus',
      'replayResultTime',
      'replayResultContentType',
      'replayResultHeaders',
      'replayResultBody'
    ].forEach(function(id) {
      var el = $(id);
      if (!el) return;
      var rawText = getFindElementText(el);
      if (!rawText || rawText.toLowerCase().indexOf(lower) === -1) return;

      if (el.tagName === 'TEXTAREA') {
        var ranges = getTextMatchRanges(rawText, lower);
        el.__replayFindRanges = ranges;
        renderFindTextControl(el, ranges, -1);
        ranges.forEach(function(range, inputIndex) {
          replayFindMatches.push({
            el: el,
            isInput: true,
            isTextControl: true,
            inputIndex: inputIndex,
            start: range.start,
            end: range.end
          });
        });
        return;
      }

      if (el.tagName === 'INPUT') {
        getTextMatchRanges(rawText, lower).forEach(function(range) {
          replayFindMatches.push({
            el: el,
            isInput: true,
            start: range.start,
            end: range.end
          });
        });
        return;
      }

      if (el.tagName === 'SELECT') {
        replayFindMatches.push({ el: el, isControl: true });
        return;
      }

      el.innerHTML = rawText.replace(re, '<span class="find-match">$1</span>');
      el.querySelectorAll('.find-match').forEach(function(span) {
        replayFindMatches.push({ el: el, span: span });
      });
    });

    replayHistory.forEach(function(item) {
      if ((item.fullLabel || item.label || '').toLowerCase().indexOf(lower) === -1 && String(item.url || '').toLowerCase().indexOf(lower) === -1) return;
      var row = replayHistoryList ? replayHistoryList.querySelector('[data-history-id="' + cssEscape(item.id) + '"]') : null;
      if (row) replayFindMatches.push({ el: row, isHistory: true });
    });

    if (replayFindMatches.length > 0) {
      replayFindIdx = preserveIndex >= 0 ? Math.min(preserveIndex, replayFindMatches.length - 1) : 0;
    }
    updateReplayFindUI({ passive: passive, keepFindFocus: !!options.keepFindFocus });
    if (replayFindIdx >= 0 && !passive) scrollToReplayMatch(replayFindIdx, { keepFindFocus: !!options.keepFindFocus });
  }

  function clearReplayFindHighlights() {
    ['replaySourceText', 'replayResultStatus', 'replayResultTime', 'replayResultContentType', 'replayResultHeaders', 'replayResultBody'].forEach(function(id) {
      var el = $(id);
      if (el && el.innerHTML !== el.textContent) el.innerHTML = el.textContent;
    });
    replayFindTextControlIds.forEach(function(id) {
      clearFindTextControl($(id));
    });
    if (replayHistoryList) {
      replayHistoryList.querySelectorAll('.find-active-row').forEach(function(node) {
        node.classList.remove('find-active-row');
      });
    }
  }

  function updateReplayFindUI(options) {
    options = options || {};
    if (replayFindCount) replayFindCount.textContent = (replayFindIdx >= 0 ? replayFindIdx + 1 : 0) + '/' + replayFindMatches.length;
    document.querySelectorAll('#tabReplay .find-match').forEach(function(el) { el.classList.remove('find-active'); });
    document.querySelectorAll('#tabReplay .find-active-row').forEach(function(el) { el.classList.remove('find-active-row'); });

    var current = replayFindMatches[replayFindIdx];
    replayFindTextControlIds.forEach(function(id) {
      var el = $(id);
      var activeIndex = current && current.isTextControl && current.el === el ? current.inputIndex : -1;
      renderFindTextControl(el, (el && el.__replayFindRanges) || [], activeIndex);
    });

    if (!current) return;
    if (current.span) current.span.classList.add('find-active');
    if (current.isHistory && current.el) current.el.classList.add('find-active-row');
    if (!options.passive && !options.keepFindFocus && current.isInput && current.el && typeof current.start === 'number' && typeof current.end === 'number') {
      focusTextRange(current.el, current.start, current.end);
    }
  }

  function scrollToReplayMatch(idx, options) {
    options = options || {};
    if (idx < 0 || idx >= replayFindMatches.length) return;
    replayFindIdx = idx;
    updateReplayFindUI({ passive: false, keepFindFocus: !!options.keepFindFocus });
    var match = replayFindMatches[idx];
    if (!match) return;

    if (match.isTextControl) {
      scrollTextControlToMatch(match, options);
      return;
    }
    if (match.span && match.span.scrollIntoView) {
      match.span.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
      restoreFindFocus(options);
      return;
    }
    if (match.el && match.el.scrollIntoView) {
      match.el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }
    if (!options.keepFindFocus && match.isInput && match.el && typeof match.start === 'number' && typeof match.end === 'number') {
      focusTextRange(match.el, match.start, match.end);
    }
    restoreFindFocus(options);
  }

  function navigateReplayFind(direction) {
    if (!replayFindInput || !replayFindInput.value) return;
    var oldIdx = replayFindIdx;
    var keepFindFocus = document.activeElement === replayFindInput;
    doReplayFind(replayFindInput.value, { passive: true, preserveIndex: oldIdx });
    if (replayFindMatches.length === 0) return;
    if (oldIdx >= 0 && oldIdx < replayFindMatches.length) replayFindIdx = oldIdx;
    replayFindIdx = direction < 0
      ? (replayFindIdx <= 0 ? replayFindMatches.length - 1 : replayFindIdx - 1)
      : (replayFindIdx >= replayFindMatches.length - 1 ? 0 : replayFindIdx + 1);
    scrollToReplayMatch(replayFindIdx, { keepFindFocus: keepFindFocus });
  }

  function reFindReplayIfNeeded() {
    if (replayFindInput && replayFindInput.value) doReplayFind(replayFindInput.value, { passive: true, preserveIndex: replayFindIdx });
  }

  function getFindElementText(el) {
    if (!el) return '';
    if (el.tagName === 'SELECT') return el.value || '';
    if ('value' in el) return String(el.value || '');
    return String(el.textContent || '');
  }

  function escapeRegExp(text) {
    return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function getTextMatchRanges(text, lowerNeedle) {
    var ranges = [];
    if (!text || !lowerNeedle) return ranges;
    var lowerText = String(text).toLowerCase();
    var start = 0;
    while (start < lowerText.length) {
      var idx = lowerText.indexOf(lowerNeedle, start);
      if (idx === -1) break;
      ranges.push({ start: idx, end: idx + lowerNeedle.length });
      start = idx + Math.max(1, lowerNeedle.length);
    }
    return ranges;
  }

  function ensureFindTextControl(el) {
    if (!el || el.__findHighlightLayer) return el ? el.__findHighlightLayer : null;
    var wrap = document.createElement('div');
    wrap.className = 'find-textarea-wrap';
    var layer = document.createElement('pre');
    layer.className = 'find-textarea-highlight';
    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(layer);
    wrap.appendChild(el);
    el.__findHighlightWrap = wrap;
    el.__findHighlightLayer = layer;
    el.addEventListener('scroll', function() {
      syncFindTextControlScroll(el);
    });
    return layer;
  }

  function renderFindTextControl(el, ranges, activeIndex) {
    if (!el) return;
    var layer = ensureFindTextControl(el);
    var wrap = el.__findHighlightWrap;
    ranges = ranges || [];
    el.__replayFindRanges = ranges;
    if (!layer || !wrap || ranges.length === 0) {
      clearFindTextControl(el);
      return;
    }
    var text = String(el.value || '');
    var html = '';
    var pos = 0;
    ranges.forEach(function(range, index) {
      html += escHtml(text.slice(pos, range.start));
      html += '<span class="find-match' + (index === activeIndex ? ' find-active' : '') + '" data-find-input-index="' + index + '">' + escHtml(text.slice(range.start, range.end)) + '</span>';
      pos = range.end;
    });
    html += escHtml(text.slice(pos)) || '&nbsp;';
    layer.innerHTML = html;
    wrap.classList.add('find-textarea-active');
    syncFindTextControlScroll(el);
  }

  function clearFindTextControl(el) {
    if (!el) return;
    el.__replayFindRanges = [];
    if (el.__findHighlightLayer) el.__findHighlightLayer.textContent = '';
    if (el.__findHighlightWrap) el.__findHighlightWrap.classList.remove('find-textarea-active');
  }

  function syncFindTextControlScroll(el) {
    if (!el || !el.__findHighlightLayer) return;
    el.__findHighlightLayer.scrollTop = el.scrollTop;
    el.__findHighlightLayer.scrollLeft = el.scrollLeft;
  }

  function scrollTextControlToMatch(match, options) {
    options = options || {};
    var el = match.el;
    if (!el) return;
    var layer = ensureFindTextControl(el);
    var marker = layer ? layer.querySelector('[data-find-input-index="' + match.inputIndex + '"]') : null;
    if (marker) {
      el.scrollTop = Math.max(0, marker.offsetTop - Math.floor(el.clientHeight / 2));
      el.scrollLeft = Math.max(0, marker.offsetLeft - Math.floor(el.clientWidth / 2));
      syncFindTextControlScroll(el);
    }
    if (el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    if (!options.keepFindFocus && typeof match.start === 'number' && typeof match.end === 'number') {
      focusTextRange(el, match.start, match.end);
    }
    restoreFindFocus(options);
  }

  function focusTextRange(el, start, end) {
    if (!el || typeof el.setSelectionRange !== 'function') return;
    try {
      el.focus({ preventScroll: true });
    } catch (e) {
      el.focus();
    }
    el.setSelectionRange(start, end);
  }

  function restoreFindFocus(options) {
    if (!options || !options.keepFindFocus) return;
    var target = options.focusEl || replayFindInput;
    if (!target) return;
    try {
      target.focus({ preventScroll: true });
    } catch (e) {
      target.focus();
    }
  }

  function cssEscape(value) {
    return String(value).replace(/"/g, '\\"');
  }

  function syncReplayHistorySelection() {
    var validMap = {};
    var visibleHistory = getVisibleReplayHistory();
    visibleHistory.forEach(function(item) { validMap[item.id] = true; });
    Object.keys(selectedReplayHistoryIds).forEach(function(id) {
      if (!validMap[id]) delete selectedReplayHistoryIds[id];
    });
    var selectedCount = Object.keys(selectedReplayHistoryIds).length;
    if (replayBatchDeleteBtn) replayBatchDeleteBtn.classList.toggle('show', selectedCount > 0);
    if (replayBatchDeleteBtn) replayBatchDeleteBtn.textContent = selectedCount > 0 ? '删除 ' + selectedCount + ' 条' : '删除选中';
    if (replayHistoryToggleAll) {
      replayHistoryToggleAll.checked = visibleHistory.length > 0 && selectedCount === visibleHistory.length;
      replayHistoryToggleAll.indeterminate = selectedCount > 0 && selectedCount < visibleHistory.length;
    }
  }

  function deleteReplayHistoryEntry(id) {
    replayHistory = replayHistory.filter(function(item) { return item.id !== id; });
    delete selectedReplayHistoryIds[id];
    persistReplayHistory();
    renderReplayHistory();
    setReplayStatus('保存请求已删除', 'success');
  }

  function resendSelectedRequest() {
    var req = replayRequestId ? findReq(replayRequestId) : null;

    var method = replayMethod && replayMethod.value ? replayMethod.value.toUpperCase() : 'GET';
    var url = replayUrl ? replayUrl.value.trim() : '';
    var headersText = replayHeaders ? replayHeaders.value : '';
    var headers = parseHeadersText(headersText);
    var body = replayBody ? replayBody.value : '';

    if (!url) {
      setReplayStatus('请输入请求 URL', 'error');
      if (replayUrl) replayUrl.focus();
      return;
    }

    var fetchOptions = {
      method: method,
      headers: headers,
      cache: 'no-store',
      credentials: 'same-origin'
    };
    if (!fetchOptions.headers['Cache-Control']) fetchOptions.headers['Cache-Control'] = 'no-cache';
    if (!fetchOptions.headers.Pragma) fetchOptions.headers.Pragma = 'no-cache';
    if (method !== 'GET' && method !== 'HEAD' && body) fetchOptions.body = body;

    sendReplayBtn.disabled = true;
    var activeThrottle = getActiveThrottleProfileForScope('replay');
    setReplayStatus(activeThrottle ? ('请求发送中... 当前弱网预设: ' + throttleSummaryText(activeThrottle)) : '请求发送中...', '');
    var startedAt = Date.now();

    Promise.resolve()
      .then(function() {
        return applyThrottleBeforeFetch(activeThrottle, fetchOptions.body || '');
      })
      .then(function() {
        return fetch(url, fetchOptions);
      }).then(function(response) {
      return response.text().then(function(text) {
        var nextHeaders = {};
        response.headers.forEach(function(value, key) {
          nextHeaders[key.toLowerCase()] = value;
        });
        return {
          ok: response.ok,
          status: response.status,
          statusText: response.statusText || '',
          headers: nextHeaders,
          body: text
        };
      });
    }).then(function(result) {
      return applyThrottleAfterFetch(activeThrottle, result.body).then(function() {
        return result;
      });
    }).then(function(result) {
      var durationMs = Date.now() - startedAt;
      if (!req) {
        req = {
          id: 'replay_' + Date.now() + '_' + random(6),
          url: url,
          method: method,
          status: 0,
          statusText: '',
          headers: {},
          resHeaders: {},
          postData: '',
          mimeType: '',
          responseContent: '',
          responseEncoding: '',
          responseBodyState: '',
          responseBodyMessage: '',
          resourceType: 'fetch',
          imported: false,
          ruleId: ''
        };
        requests.unshift(req);
        if (requests.length > 500) requests.length = 500;
      }
      req.method = method;
      req.url = url;
      req.headers = normalizeHeaderKeys(headers);
      req.postData = method === 'GET' || method === 'HEAD' ? '' : body;
      req.status = result.status;
      req.statusText = result.statusText;
      req.resHeaders = result.headers;
      req.responseContent = result.body;
      req.responseEncoding = '';
      req.responseBodyState = req.responseContent ? 'text' : 'empty';
      req.responseBodyMessage = req.responseContent ? '' : '该请求没有可返回的响应体。';
      req.mimeType = result.headers['content-type'] || req.mimeType || '';
      req.resourceType = requestTypeFromValues(url, req.mimeType);
      req.lastReplayDurationMs = durationMs;
      req.totalTimeMs = durationMs;
      req.timeSource = 'replay';
      replayRequestId = req.id;
      req.imported = hasImportedRuleForRequest(req);
      if (!req.imported) req.ruleId = '';
      syncReplayHistoryResult(method, url, headersText, body, result.status, result.statusText, durationMs);
      updateStoredRequestSnapshot(req);
      renderNetworkList();
      renderBeaconTab();
      if (selectedId === req.id) showDetails(req.id);
      renderReplayTab();
      updateBadge();
      setReplayStatus('请求已完成，状态码 ' + result.status + '，耗时 ' + durationMs + ' ms', result.ok ? 'success' : 'error');
      showToast(result.ok ? '请求已重发' : ('请求返回错误状态码 ' + result.status), result.ok ? undefined : 'error');
    }).catch(function(error) {
      setReplayStatus('发送失败: ' + error.message, 'error');
      showToast('发送失败: ' + error.message, 'error');
    }).finally(function() {
      sendReplayBtn.disabled = false;
    });
  }

  // Import request → create rule
  function importRequest(req) {
    if (req.imported) return;

    var body = req.responseContent || '';
    try { body = JSON.stringify(JSON.parse(body), null, 2); } catch(e) {}

    var headerObj = {};
    var ct = req.resHeaders['content-type'] || 'application/json';
    headerObj['Content-Type'] = ct;
    ['access-control-allow-origin', 'cache-control'].forEach(function(k) {
      if (req.resHeaders[k]) headerObj[k] = req.resHeaders[k];
    });

    var name = ruleNameFromUrl(req.url, req.method);
    var rule = {
      id: genId(),
      name: name,
      enabled: false,
      method: req.method,
      url: { pattern: toMockPathPattern(req.url), matchType: 'contains' },
      bodyMatch: {
        enabled: false,
        field: '',
        value: '',
        matchType: 'contains'
      },
      response: { statusCode: req.status, headers: headerObj, body: body },
      delay: 0,
      createdAt: Date.now(),
      group: activeGroup
    };

    chrome.runtime.sendMessage({ type: 'SAVE_RULE', rule: rule }, function() {
      req.imported = true;
      req.ruleId = rule.id;
      updateStoredRequestImport(req);
      renderNetworkList();
      renderBeaconTab();
      showDetails(req.id);
      showToast('✦ 已导入: ' + name);
    });
  }

  function unimportRequest(req) {
    if (!req || !req.imported || !req.ruleId) return;
    var ruleId = req.ruleId;
    chrome.runtime.sendMessage({ type: 'DELETE_RULE', ruleId: ruleId }, function() {
      req.imported = false;
      req.ruleId = '';
      updateStoredRequestImport(req);
      loadRules();
      renderNetworkList();
      renderBeaconTab();
      if (selectedId === req.id) showDetails(req.id);
      showToast('已取消导入 Mock');
    });
  }

  function updateStoredRequestImport(req) {
    chrome.storage.local.get('capturedRequests', function(result) {
      var list = result.capturedRequests || [];
      var changed = false;
      list.forEach(function(item) {
        if (item.id === req.id || (item.url === req.url && item.method === req.method)) {
          item.imported = !!req.imported;
          item.ruleId = req.ruleId || '';
          changed = true;
        }
      });
      if (changed) chrome.storage.local.set({ capturedRequests: list });
    });
  }

  function updateStoredRequestSnapshot(req) {
    chrome.storage.local.get('capturedRequests', function(result) {
      var list = result.capturedRequests || [];
      var changed = false;
      list.forEach(function(item) {
        if (item.id === req.id) {
          item.url = req.url;
          item.method = req.method;
          item.status = req.status;
          item.statusText = req.statusText;
          item.resHeaders = req.resHeaders;
          item.totalTimeMs = req.totalTimeMs || 0;
          item.timeSource = req.timeSource || '';
          item.startedDateTime = req.startedDateTime || '';
          item.cookies = req.cookies || [];
          item.setCookies = req.setCookies || [];
          item.mimeType = req.mimeType;
          item.responseContent = req.responseContent;
          item.responseEncoding = req.responseEncoding || '';
          item.responseBodyState = req.responseBodyState || '';
          item.responseBodyMessage = req.responseBodyMessage || '';
          item.imported = !!req.imported;
          item.ruleId = req.ruleId || '';
          changed = true;
        }
      });
      if (changed) chrome.storage.local.set({ capturedRequests: list });
    });
  }

  function getEntryTotalTimeInfo(entry) {
    if (entry && typeof entry.time === 'number' && isFinite(entry.time) && entry.time >= 0) {
      return { value: Math.round(entry.time), source: 'har' };
    }
    var timings = entry && entry.timings ? entry.timings : null;
    if (!timings) return { value: 0, source: '' };
    var total = 0;
    ['blocked', 'dns', 'connect', 'send', 'wait', 'receive', 'ssl'].forEach(function(key) {
      var value = timings[key];
      if (typeof value === 'number' && isFinite(value) && value > 0) total += value;
    });
    return total > 0 ? { value: Math.round(total), source: 'timings' } : { value: 0, source: '' };
  }

  function normalizeReplayStatus(value) {
    var status = Number(value) || 0;
    return status >= 100 ? status : 0;
  }

  function normalizeReplayDurationMs(value) {
    var duration = Number(value) || 0;
    return duration > 0 ? Math.round(duration) : 0;
  }

  function replayHistoryNameText(item) {
    var name = String((item && (item.name || item.label)) || '').trim();
    var requestLine = ((item && item.method) || 'GET') + ' ' + displayPath((item && item.url) || '');
    return name && name !== requestLine ? name : '未命名';
  }

  function truncateReplayHistoryName(name) {
    var value = String(name || '');
    return value.length > 15 ? value.slice(0, 15) + '...' : value;
  }

  function normalizeReplayText(value) {
    return String(value || '').replace(/\r\n/g, '\n');
  }

  function isReplayHistorySameRequest(item, method, url, headersText, body) {
    return !!item &&
      (item.method || 'GET').toUpperCase() === String(method || 'GET').toUpperCase() &&
      item.url === url &&
      replayHeadersSignature(item.headersText) === replayHeadersSignature(headersText) &&
      normalizeReplayText(item.body) === normalizeReplayText(body);
  }

  function getReplaySourceForCurrentForm(method, url, headersText, body) {
    var req = replayRequestId ? findReq(replayRequestId) : null;
    if (!req) return null;
    if ((req.method || 'GET').toUpperCase() !== String(method || 'GET').toUpperCase() || req.url !== url) return null;
    if (replayHeadersSignature(buildReplayHeadersText(req)) !== replayHeadersSignature(headersText)) return null;
    if (normalizeReplayText(req.postData || '') !== normalizeReplayText(body)) return null;
    return req;
  }

  function replayHeadersSignature(text) {
    var headers = normalizeHeaderKeys(parseHeadersText(text || ''));
    return Object.keys(headers).sort().map(function(key) {
      return key + ':' + headers[key];
    }).join('\n');
  }

  function clearReplaySourceRequest() {
    var req = replayRequestId ? findReq(replayRequestId) : null;
    if (req) req.replayImported = false;
    replayRequestId = null;
    refreshDetailImportState();
    renderNetworkList();
  }

  function syncReplayHistoryResult(method, url, headersText, body, status, statusText, durationMs) {
    var changed = false;
    replayHistory.forEach(function(item) {
      if (!isReplayHistorySameRequest(item, method, url, headersText, body)) return;
      item.status = normalizeReplayStatus(status);
      item.statusText = statusText || '';
      item.totalTimeMs = normalizeReplayDurationMs(durationMs);
      changed = true;
    });
    if (changed) persistReplayHistory();
  }

  function formatTimeSource(source) {
    if (source === 'har') return 'HAR';
    if (source === 'timings') return 'timings';
    if (source === 'replay') return 'Replay';
    return '-';
  }

  function formatTimeSourceHint(source) {
    if (source === 'har') return 'HAR: 浏览器 DevTools/HAR 提供的原生总耗时';
    if (source === 'timings') return 'timings: 使用请求各阶段耗时相加得到的近似总耗时';
    if (source === 'replay') return 'Replay: 使用本插件重新发送请求时记录的耗时';
    return '耗时来源未知';
  }

  function loadCookieEntries() {
    try {
      cookieEntries = JSON.parse(localStorage.getItem('apiStudioCookieEntries') || '[]');
      if (!Array.isArray(cookieEntries)) cookieEntries = [];
    } catch(e) {
      cookieEntries = [];
    }
  }

  function persistCookieEntries() {
    try { localStorage.setItem('apiStudioCookieEntries', JSON.stringify(cookieEntries)); } catch(e) {}
  }

  function renderCookiesTab() {
    if (!cookiesList) return;
    if (cookiesCountBadge) cookiesCountBadge.textContent = cookieEntries.length + ' 组 Cookies';
    if (cookieEntries.length === 0) {
      cookiesList.innerHTML = '';
      if (cookiesEmpty) cookiesList.appendChild(cookiesEmpty);
      if (cookiesDetailEmpty) cookiesDetailEmpty.style.display = 'flex';
      if (cookiesDetailContent) cookiesDetailContent.style.display = 'none';
      return;
    }
    if (!selectedCookieEntryId) selectedCookieEntryId = cookieEntries[0].id;
    cookiesList.innerHTML = cookieEntries.map(function(item, index) {
      return '<div class="cookies-item' + (item.id === selectedCookieEntryId ? ' active' : '') + '" data-id="' + escAttr(item.id) + '">' +
        '<div class="cookies-item-title">#' + (index + 1) + ' ' + escHtml(item.method + ' ' + item.path) + '</div>' +
        '<div class="cookies-item-meta">' + escHtml(item.timeText || '') + '<br>Cookies ' + (item.cookies || []).length + ' · Set-Cookie ' + (item.setCookies || []).length + '</div>' +
      '</div>';
    }).join('');
    showCookieEntry(selectedCookieEntryId);
  }

  function loadBeaconConfig() {
    try {
      var saved = JSON.parse(localStorage.getItem('apiStudioBeaconConfig') || '{}');
      if (saved && typeof saved === 'object') {
        beaconConfig.path = String(saved.path || '');
        beaconConfig.conditions = normalizeBeaconConditions(saved.conditions || buildLegacyBeaconConditions(saved));
        beaconConfig.enabled = saved.enabled !== false;
      }
    } catch (e) {}
    if (beaconPathInput) beaconPathInput.value = beaconConfig.path;
    renderBeaconConditionRows();
    if (beaconEnabled) beaconEnabled.checked = beaconConfig.enabled;
  }

  function persistBeaconConfig() {
    try {
      localStorage.setItem('apiStudioBeaconConfig', JSON.stringify(beaconConfig));
    } catch (e) {}
  }

  function buildLegacyBeaconConditions(saved) {
    if (!saved || (!saved.field && !saved.contains)) return [];
    return [{ field: saved.field || '', contains: saved.contains || '' }];
  }

  function normalizeBeaconConditions(conditions) {
    return (conditions || []).map(function(item) {
      return {
        field: String((item && item.field) || '').trim(),
        contains: String((item && item.contains) || '').trim()
      };
    }).filter(function(item) {
      return item.field || item.contains;
    });
  }

  function getBeaconConditions() {
    return normalizeBeaconConditions(beaconConfig.conditions || []);
  }

  function renderBeaconConditionRows() {
    if (!beaconConditions) return;
    var rows = (beaconConfig.conditions && beaconConfig.conditions.length ? beaconConfig.conditions : [{ field: '', contains: '' }]);
    beaconConditions.innerHTML = rows.map(function(item, index) {
      return '<div class="beacon-condition-row" data-index="' + index + '">' +
        '<input class="form-input beacon-input beacon-condition-key" type="text" placeholder="关注的字段 key" value="' + escAttr(item.field || '') + '">' +
        '<input class="form-input beacon-input beacon-condition-value" type="text" placeholder="对应 value" value="' + escAttr(item.contains || '') + '">' +
        '<button class="btn btn-sm beacon-condition-remove" data-action="delete-beacon-condition" type="button" title="删除条件">删除</button>' +
      '</div>';
    }).join('');
    updateBeaconConditionRemoveState();
    updateBeaconConditionVisibility();
  }

  function updateBeaconConditionVisibility() {
    if (beaconConditions) beaconConditions.classList.toggle('collapsed', !beaconConditionsExpanded);
    if (addBeaconConditionBtn) addBeaconConditionBtn.style.display = beaconConditionsExpanded ? 'inline-flex' : 'none';
    if (toggleBeaconConditionsBtn) toggleBeaconConditionsBtn.textContent = beaconConditionsExpanded ? '收起条件' : '编辑条件';
    if (beaconConditionSummary) beaconConditionSummary.style.display = beaconConditionsExpanded ? 'none' : 'flex';
    renderBeaconConditionSummary();
  }

  function renderBeaconConditionSummary() {
    if (!beaconConditionSummary) return;
    var conditions = getBeaconConditions();
    if (!conditions.length) {
      beaconConditionSummary.classList.add('empty');
      beaconConditionSummary.textContent = '未设置关注条件';
      return;
    }
    beaconConditionSummary.classList.remove('empty');
    beaconConditionSummary.innerHTML = conditions.map(function(item) {
      var text = item.field + (item.contains ? '=' + item.contains : '');
      return '<span class="beacon-condition-chip" title="' + escAttr(text) + '">' + escHtml(text) + '</span>';
    }).join('');
  }

  function syncBeaconConditionsFromDom() {
    if (!beaconConditions) return;
    beaconConfig.conditions = Array.prototype.slice.call(beaconConditions.querySelectorAll('.beacon-condition-row')).map(function(row) {
      return {
        field: ((row.querySelector('.beacon-condition-key') || {}).value || '').trim(),
        contains: ((row.querySelector('.beacon-condition-value') || {}).value || '').trim()
      };
    });
  }

  function ensureBeaconConditionRows() {
    if (!beaconConditions || beaconConditions.querySelector('.beacon-condition-row')) {
      updateBeaconConditionRemoveState();
      return;
    }
    beaconConfig.conditions = [{ field: '', contains: '' }];
    renderBeaconConditionRows();
  }

  function updateBeaconConditionRemoveState() {
    if (!beaconConditions) return;
    var rows = beaconConditions.querySelectorAll('.beacon-condition-row');
    rows.forEach(function(row) {
      var btn = row.querySelector('.beacon-condition-remove');
      if (btn) btn.style.visibility = rows.length <= 1 ? 'hidden' : 'visible';
    });
  }

  function renderBeaconTab() {
    if (!beaconList || !beaconCountBadge) return;
    var matches = getBeaconMatches();
    beaconCountBadge.textContent = matches.length > 0 ? String(matches.length) : '';
    beaconCountBadge.classList.toggle('show', matches.length > 0);
    beaconCountBadge.title = matches.length + ' 条命中';
    if (matches.length === 0) {
      beaconList.innerHTML = '';
      if (beaconEmpty) beaconList.appendChild(beaconEmpty);
      if (beaconDetailEmpty) beaconDetailEmpty.style.display = 'flex';
      if (beaconDetailContent) beaconDetailContent.style.display = 'none';
      return;
    }
    if (!selectedBeaconId || !matches.some(function(item) { return item.id === selectedBeaconId; })) {
      selectedBeaconId = matches[0].id;
    }
    beaconList.innerHTML = matches.map(function(item, index) {
      var req = item.req;
      var fieldBadge = item.fieldValues.length
        ? '<span class="beacon-match-badge">' + escHtml(item.fieldValues.length + ' 个字段值') + '</span>'
        : '';
      return '<div class="beacon-match-item' + (item.id === selectedBeaconId ? ' active' : '') + '" data-beacon-id="' + escAttr(item.id) + '">' +
        '<div class="beacon-match-top">' +
          '<span class="beacon-match-method method ' + escAttr((req.method || 'GET').toUpperCase()) + '">' + escHtml(req.method || 'GET') + '</span>' +
          fieldBadge +
        '</div>' +
        '<div class="beacon-match-meta">#' + (index + 1) + ' · ' + escHtml(formatDateTime(new Date(req.startedDateTime || Date.now()))) + '</div>' +
        '<div class="beacon-match-path" title="' + escAttr(req.url || '') + '">' + escHtml(displayPath(req.url || '')) + '</div>' +
        '<div class="beacon-match-bottom">' +
          '<div class="beacon-match-meta">' + escHtml(item.summary) + '</div>' +
          '<button class="beacon-match-delete" data-action="delete-beacon-match" type="button" title="删除这条命中">删除</button>' +
        '</div>' +
      '</div>';
    }).join('');
    showBeaconDetail(selectedBeaconId, matches);
  }

  function showBeaconDetail(id, matches) {
    var match = (matches || getBeaconMatches()).find(function(item) { return item.id === id; });
    if (!match) {
      if (beaconDetailEmpty) beaconDetailEmpty.style.display = 'flex';
      if (beaconDetailContent) beaconDetailContent.style.display = 'none';
      return;
    }
    if (beaconDetailEmpty) beaconDetailEmpty.style.display = 'none';
    if (beaconDetailContent) beaconDetailContent.style.display = 'block';
    setText('beaconDetailPath', displayPath(match.req.url || ''));
    setText('beaconDetailMethod', match.req.method || 'GET');
    setText('beaconDetailTime', formatDateTime(new Date(match.req.startedDateTime || Date.now())));
    var conditions = getBeaconConditions();
    var fieldText = conditions.length
      ? (match.matchedConditions.length + '/' + conditions.length + ' 个条件命中')
      : '未设置关注字段';
    setText('beaconDetailField', fieldText);
    var fieldEl = $('beaconDetailField');
    if (fieldEl) fieldEl.className = 'value ' + (conditions.length && match.matchedConditions.length === conditions.length ? 'beacon-field-hit' : 'beacon-field-miss');
    setText('beaconDetailFieldValues', match.fieldValues.length ? match.fieldValues.map(function(item) { return item.path + ': ' + item.value; }).join('\n') : '无');
    setBeaconPayloadHtml(match);
  }

  function setBeaconPayloadHtml(match) {
    var el = $('beaconDetailPayload');
    if (!el) return;
    if (!match || !match.payloadText) {
      el.textContent = '无';
      return;
    }
    el.innerHTML = buildHighlightedBeaconPayloadHtml(match.parsed && match.parsed.merged, getBeaconConditions());
  }

  function getBeaconMatches() {
    if (!beaconConfig.enabled || !beaconConfig.path) return [];
    var conditions = getBeaconConditions();
    return requests.filter(function(req) {
      return isBeaconMatch(req);
    }).map(function(req) {
      var parsed = parseBeaconPayload(req);
      var conditionResult = matchBeaconConditions(parsed.merged, conditions);
      if (!conditionResult.matched) return null;
      return {
        id: req.id,
        req: req,
        parsed: parsed,
        fieldValues: conditionResult.fieldValues,
        matchedConditions: conditionResult.matchedConditions,
        payloadText: stringifyBeaconPayload(parsed.merged),
        summary: buildBeaconSummary(parsed, conditionResult.fieldValues, conditions)
      };
    }).filter(Boolean);
  }

  function findBeaconMatch(id) {
    return getBeaconMatches().find(function(item) { return item.id === id; }) || null;
  }

  function deleteBeaconMatch(id) {
    if (!id) return;
    requests = requests.filter(function(req) { return req.id !== id; });
    if (selectedBeaconId === id) selectedBeaconId = '';
    if (selectedId === id) {
      selectedId = null;
      if (detailEmpty) detailEmpty.style.display = 'flex';
      if (detailContent) detailContent.style.display = 'none';
    }
    chrome.storage.local.get('capturedRequests', function(result) {
      var list = (result.capturedRequests || []).filter(function(req) { return req.id !== id; });
      chrome.storage.local.set({ capturedRequests: list });
    });
    renderNetworkList();
    renderBeaconTab();
    updateBadge();
    showToast('命中记录已删除');
  }

  function isBeaconMatch(req) {
    if (!req || !req.url) return false;
    var pathKey = beaconConfig.path.toLowerCase();
    var target = (displayPath(req.url) + '\n' + req.url).toLowerCase();
    if (target.indexOf(pathKey) === -1) return false;
    var conditions = getBeaconConditions();
    if (!conditions.length) return true;
    var parsed = parseBeaconPayload(req);
    return matchBeaconConditions(parsed.merged, conditions).matched;
  }

  function parseBeaconPayload(req) {
    var query = {};
    try {
      var u = new URL(req.url || '');
      u.searchParams.forEach(function(value, key) {
        if (query[key] === undefined) query[key] = value;
        else if (Array.isArray(query[key])) query[key].push(value);
        else query[key] = [query[key], value];
      });
    } catch (e) {}
    var bodyRaw = req.postData || '';
    var bodyParsed = parseBeaconBody(bodyRaw, req.headers || {});
    return {
      query: query,
      body: bodyParsed,
      merged: {
        query: query,
        body: bodyParsed
      }
    };
  }

  function parseBeaconBody(bodyRaw, headers) {
    if (!bodyRaw) return {};
    var contentType = String((headers || {})['content-type'] || '').toLowerCase();
    if (contentType.indexOf('json') !== -1) {
      try { return JSON.parse(bodyRaw); } catch (e) {}
    }
    if (contentType.indexOf('x-www-form-urlencoded') !== -1) {
      var form = {};
      String(bodyRaw).split('&').forEach(function(pair) {
        if (!pair) return;
        var idx = pair.indexOf('=');
        var key = decodeURIComponent(idx >= 0 ? pair.slice(0, idx) : pair);
        var value = decodeURIComponent(idx >= 0 ? pair.slice(idx + 1) : '');
        if (form[key] === undefined) form[key] = value;
        else if (Array.isArray(form[key])) form[key].push(value);
        else form[key] = [form[key], value];
      });
      return form;
    }
    try { return JSON.parse(bodyRaw); } catch (e2) {}
    return { raw: bodyRaw };
  }

  function matchBeaconConditions(source, conditions) {
    var result = { matched: true, fieldValues: [], matchedConditions: [] };
    if (!conditions.length) return result;
    conditions.forEach(function(condition) {
      var values = collectBeaconFieldValues(source, condition.field);
      if (condition.contains) {
        var containsLower = condition.contains.toLowerCase();
        values = values.filter(function(item) {
          return String(item.value).toLowerCase().indexOf(containsLower) !== -1;
        });
      }
      if (!condition.field || values.length === 0) {
        result.matched = false;
        return;
      }
      result.matchedConditions.push(condition);
      result.fieldValues = result.fieldValues.concat(values);
    });
    return result;
  }

  function buildHighlightedBeaconPayloadHtml(payload, conditions) {
    var highlightRules = (conditions || []).map(function(condition) {
      return {
        fieldLower: String(condition.field || '').trim().toLowerCase(),
        containsLower: String(condition.contains || '').trim().toLowerCase()
      };
    }).filter(function(rule) { return !!rule.fieldLower; });
    var lines = [];
    renderBeaconJsonValue(payload, '', 0, lines, highlightRules);
    return lines.join('\n') || '无';
  }

  function renderBeaconJsonValue(value, path, depth, lines, highlightRules) {
    var indent = repeatSpaces(depth * 2);
    if (Array.isArray(value)) {
      lines.push(indent + '[');
      value.forEach(function(item, index) {
        var before = lines.length;
        renderBeaconJsonValue(item, path + '[' + index + ']', depth + 1, lines, highlightRules);
        appendCommaToLastLine(lines, before, index < value.length - 1);
      });
      lines.push(indent + ']');
      return;
    }
    if (value && typeof value === 'object') {
      var keys = Object.keys(value);
      lines.push(indent + '{');
      keys.forEach(function(key, index) {
        var nextPath = path ? path + '.' + key : key;
        var hitRule = getBeaconHighlightRule(key, null, highlightRules);
        var keyHtml = escHtml(JSON.stringify(key));
        if (hitRule) keyHtml = '<span class="beacon-json-hit-key">' + keyHtml + '</span>';
        var item = value[key];
        if (item && typeof item === 'object') {
          lines.push(repeatSpaces((depth + 1) * 2) + keyHtml + ': ' + (Array.isArray(item) ? '[' : '{'));
          renderBeaconJsonChildren(item, nextPath, depth + 2, lines, highlightRules);
          lines.push(repeatSpaces((depth + 1) * 2) + (Array.isArray(item) ? ']' : '}') + (index < keys.length - 1 ? ',' : ''));
        } else {
          lines.push(repeatSpaces((depth + 1) * 2) + keyHtml + ': ' + formatBeaconJsonPrimitive(item, key, highlightRules) + (index < keys.length - 1 ? ',' : ''));
        }
      });
      lines.push(indent + '}');
      return;
    }
    lines.push(indent + formatBeaconJsonPrimitive(value, '', highlightRules));
  }

  function renderBeaconJsonChildren(value, path, depth, lines, highlightRules) {
    var entries = Array.isArray(value) ? value : Object.keys(value);
    entries.forEach(function(entry, index) {
      if (Array.isArray(value)) {
        var before = lines.length;
        renderBeaconJsonValue(entry, path + '[' + index + ']', depth, lines, highlightRules);
        appendCommaToLastLine(lines, before, index < entries.length - 1);
        return;
      }
      var key = entry;
      var nextPath = path ? path + '.' + key : key;
      var hitRule = getBeaconHighlightRule(key, null, highlightRules);
      var keyHtml = escHtml(JSON.stringify(key));
      if (hitRule) keyHtml = '<span class="beacon-json-hit-key">' + keyHtml + '</span>';
      var item = value[key];
      if (item && typeof item === 'object') {
        lines.push(repeatSpaces(depth * 2) + keyHtml + ': ' + (Array.isArray(item) ? '[' : '{'));
        renderBeaconJsonChildren(item, nextPath, depth + 1, lines, highlightRules);
        lines.push(repeatSpaces(depth * 2) + (Array.isArray(item) ? ']' : '}') + (index < entries.length - 1 ? ',' : ''));
      } else {
        lines.push(repeatSpaces(depth * 2) + keyHtml + ': ' + formatBeaconJsonPrimitive(item, key, highlightRules) + (index < entries.length - 1 ? ',' : ''));
      }
    });
  }

  function appendCommaToLastLine(lines, beforeIndex, shouldAppend) {
    if (!shouldAppend || lines.length <= beforeIndex) return;
    lines[lines.length - 1] += ',';
  }

  function formatBeaconJsonPrimitive(value, key, highlightRules) {
    var text = JSON.stringify(value);
    if (text === undefined) text = String(value);
    var shouldHighlight = !!getBeaconHighlightRule(key, value, highlightRules);
    var html = escHtml(text);
    return shouldHighlight ? '<span class="beacon-json-hit-value">' + html + '</span>' : html;
  }

  function getBeaconHighlightRule(key, value, highlightRules) {
    var keyLower = String(key || '').toLowerCase();
    return (highlightRules || []).find(function(rule) {
      if (!rule.fieldLower || keyLower !== rule.fieldLower) return false;
      if (!rule.containsLower || value === null) return true;
      return String(value).toLowerCase().indexOf(rule.containsLower) !== -1;
    }) || null;
  }

  function repeatSpaces(count) {
    return new Array(count + 1).join(' ');
  }

  function collectBeaconFieldValues(source, fieldName) {
    var hits = [];
    if (!fieldName) return hits;
    walkBeaconObject(source, '', String(fieldName).toLowerCase(), hits);
    return hits;
  }

  function walkBeaconObject(value, path, fieldLower, hits) {
    if (Array.isArray(value)) {
      value.forEach(function(item, index) {
        walkBeaconObject(item, path + '[' + index + ']', fieldLower, hits);
      });
      return;
    }
    if (!value || typeof value !== 'object') return;
    Object.keys(value).forEach(function(key) {
      var nextPath = path ? path + '.' + key : key;
      if (String(key).toLowerCase() === fieldLower) {
        hits.push({
          path: nextPath,
          value: typeof value[key] === 'object' ? JSON.stringify(value[key]) : String(value[key])
        });
      }
      walkBeaconObject(value[key], nextPath, fieldLower, hits);
    });
  }

  function stringifyBeaconPayload(payload) {
    try { return JSON.stringify(payload, null, 2); } catch (e) { return String(payload || ''); }
  }

  function buildBeaconSummary(parsed, fieldValues, conditions) {
    var parts = [];
    var queryKeys = Object.keys(parsed.query || {});
    var bodyKeys = parsed.body && typeof parsed.body === 'object' ? Object.keys(parsed.body) : [];
    if (queryKeys.length) parts.push('Query ' + queryKeys.length + ' 项');
    if (bodyKeys.length) parts.push('Body ' + bodyKeys.length + ' 项');
    if ((conditions || []).length) {
      parts.push(fieldValues.length ? ('条件命中 ' + fieldValues.length + ' 项') : '条件未命中');
    }
    return parts.join(' · ') || '无可解析字段';
  }

  function showCookieEntry(id) {
    var entry = cookieEntries.find(function(item) { return item.id === id; });
    if (!entry) return;
    selectedCookieEntryId = id;
    if (cookiesDetailEmpty) cookiesDetailEmpty.style.display = 'none';
    if (cookiesDetailContent) cookiesDetailContent.style.display = 'block';
    setText('cookiesDetailPath', entry.path || '');
    setText('cookiesDetailMethod', entry.method || 'GET');
    setText('cookiesDetailTime', entry.timeText || '-');
    setText('cookiesDetailReq', formatCookieLines(entry.cookies));
    setText('cookiesDetailSet', formatSetCookieLines(entry.setCookies));
    if (cookiesList) {
      cookiesList.querySelectorAll('.cookies-item').forEach(function(node) {
        node.classList.toggle('active', node.dataset.id === id);
      });
    }
  }

  function loadThrottleProfiles() {
    chrome.storage.local.get(['throttleProfiles', 'activeThrottleProfileId'], function(result) {
      throttleProfiles = mergeDefaultThrottleProfiles(result.throttleProfiles).map(normalizeThrottleProfile);
      activeThrottleProfileId = result.activeThrottleProfileId || '';
      renderThrottleTab();
    });
  }

  function persistThrottleProfiles() {
    chrome.storage.local.set({
      throttleProfiles: throttleProfiles,
      activeThrottleProfileId: activeThrottleProfileId || ''
    }, function() {
      renderThrottleTab();
    });
  }

  function defaultThrottleProfiles() {
    return [
      { id: 'thr_2g', name: '2G', latency: 800, jitterMs: 200, downloadKbps: 150, uploadKbps: 80, scopes: { replay: true, mock: false, page: false }, enabled: false },
      { id: 'thr_slow_3g', name: 'Slow 3G', latency: 400, jitterMs: 80, downloadKbps: 400, uploadKbps: 400, scopes: { replay: true, mock: false, page: false }, enabled: false },
      { id: 'thr_fast_3g', name: 'Fast 3G', latency: 150, jitterMs: 40, downloadKbps: 1600, uploadKbps: 750, scopes: { replay: true, mock: false, page: false }, enabled: false },
      { id: 'thr_4g', name: '4G', latency: 80, jitterMs: 20, downloadKbps: 9000, uploadKbps: 9000, scopes: { replay: true, mock: false, page: false }, enabled: false }
    ];
  }

  function mergeDefaultThrottleProfiles(profiles) {
    var list = Array.isArray(profiles) && profiles.length ? profiles.slice() : [];
    var seen = {};
    list.forEach(function(item) {
      if (item && item.id) seen[item.id] = true;
    });
    defaultThrottleProfiles().slice().reverse().forEach(function(item) {
      if (!seen[item.id]) list.unshift(item);
    });
    return list;
  }

  function normalizeThrottleProfile(profile) {
    profile = profile || {};
    return {
      id: profile.id || ('thr_' + Date.now() + '_' + random(6)),
      name: profile.name || '未命名预设',
      latency: nonNegativeNumber(profile.latency),
      jitterMs: nonNegativeNumber(profile.jitterMs),
      downloadKbps: nonNegativeNumber(profile.downloadKbps),
      uploadKbps: nonNegativeNumber(profile.uploadKbps),
      scopes: normalizeThrottleScopes(profile.scopes),
      enabled: profile.enabled === true
    };
  }

  function normalizeThrottleScopes(scopes) {
    scopes = scopes || {};
    return {
      replay: scopes.replay !== false,
      mock: scopes.mock === true,
      page: scopes.page === true
    };
  }

  function renderThrottleTab() {
    if (!throttleList) return;
    var active = throttleProfiles.find(function(item) { return item.id === activeThrottleProfileId; });
    if (throttleStatusBadge) throttleStatusBadge.textContent = active ? ('当前: ' + active.name) : '未启用弱网';
    if (throttleTabStatusDot) throttleTabStatusDot.classList.toggle('show', !!active);
    if (throttleProfiles.length === 0) {
      throttleList.innerHTML = '';
      if (throttleEmpty) throttleList.appendChild(throttleEmpty);
      if (throttleDetailEmpty) throttleDetailEmpty.style.display = 'flex';
      if (throttleDetailContent) throttleDetailContent.style.display = 'none';
      return;
    }
    if (!selectedThrottleId || !throttleProfiles.some(function(item) { return item.id === selectedThrottleId; })) {
      selectedThrottleId = throttleProfiles[0].id;
    }
    throttleList.innerHTML = throttleProfiles.map(function(item) {
      var isActive = item.id === activeThrottleProfileId;
      return '<div class="config-item' + (item.id === selectedThrottleId ? ' active' : '') + '" data-throttle-id="' + escAttr(item.id) + '">' +
        '<div class="config-item-top">' +
          '<span class="config-item-name">' + escHtml(item.name || '未命名预设') + '</span>' +
          '<span class="config-item-state' + (isActive ? ' enabled' : '') + '">' + (isActive ? '当前使用' : '未使用') + '</span>' +
        '</div>' +
        '<div class="config-item-meta">' +
          '<div>' + escHtml(throttleLatencyText(item)) + '</div>' +
          '<div>下行 ' + escHtml(String(item.downloadKbps || 0)) + ' kbps · 上行 ' + escHtml(String(item.uploadKbps || 0)) + ' kbps</div>' +
          '<div>作用域 ' + escHtml(formatThrottleScopes(item.scopes)) + '</div>' +
        '</div>' +
      '</div>';
    }).join('');
    showThrottleProfile(selectedThrottleId);
  }

  function showThrottleProfile(id) {
    var entry = throttleProfiles.find(function(item) { return item.id === id; });
    if (!entry) return;
    selectedThrottleId = id;
    if (throttleDetailEmpty) throttleDetailEmpty.style.display = 'none';
    if (throttleDetailContent) throttleDetailContent.style.display = 'block';
    setText('throttleDetailName', entry.name || '未命名预设');
    setText('throttleDetailLatency', String(entry.latency || 0) + ' ms');
    setText('throttleDetailJitter', String(entry.jitterMs || 0) + ' ms');
    setText('throttleDetailDown', String(entry.downloadKbps || 0) + ' kbps');
    setText('throttleDetailUp', String(entry.uploadKbps || 0) + ' kbps');
    setText('throttleDetailScopes', formatThrottleScopes(entry.scopes));
    setText('throttleDetailStatus', entry.id === activeThrottleProfileId ? '当前启用' : '未启用');
    setText('throttleDetailPreview', buildThrottlePreview(entry));
    syncThrottleScopeControls(entry);
    if (throttleDetailStatus) throttleDetailStatus.className = 'value ' + (entry.id === activeThrottleProfileId ? 'config-status-active' : 'config-status-inactive');
    if (applyThrottleBtn) applyThrottleBtn.textContent = entry.id === activeThrottleProfileId ? '取消当前预设' : '设为当前预设';
    throttleList.querySelectorAll('.config-item').forEach(function(node) {
      node.classList.toggle('active', node.dataset.throttleId === id);
    });
  }

  function buildThrottlePreview(entry) {
    return [
      '名称: ' + (entry.name || ''),
      '延迟: ' + (entry.latency || 0) + ' ms',
      '抖动: ±' + (entry.jitterMs || 0) + ' ms',
      '下行: ' + (entry.downloadKbps || 0) + ' kbps',
      '上行: ' + (entry.uploadKbps || 0) + ' kbps',
      '作用域: ' + formatThrottleScopes(entry.scopes),
      '',
      '启用的作用域会模拟延迟/抖动和上下行传输耗时。'
    ].join('\n');
  }

  function throttleLatencyText(entry) {
    return '延迟 ' + (entry.latency || 0) + ' ms' + ((entry.jitterMs || 0) ? ' ±' + entry.jitterMs + ' ms' : '');
  }

  function formatThrottleScopes(scopes) {
    scopes = normalizeThrottleScopes(scopes);
    var labels = [];
    if (scopes.replay) labels.push('Replay');
    if (scopes.mock) labels.push('Mock 命中接口');
    if (scopes.page) labels.push('页面全局');
    return labels.length ? labels.join(' / ') : '未启用';
  }

  function helpLabel(text, tip) {
    return '<span class="config-label-help">' + escHtml(text) + helpIcon(tip) + '</span>';
  }

  function helpIcon(tip) {
    return '<span class="config-help" tabindex="0" aria-label="' + escAttr(tip) + '" data-tip="' + escAttr(tip) + '">?</span>';
  }

  function syncThrottleScopeControls(entry) {
    var scopes = normalizeThrottleScopes(entry && entry.scopes);
    if (throttleScopeReplay) throttleScopeReplay.checked = !!scopes.replay;
    if (throttleScopeMock) throttleScopeMock.checked = !!scopes.mock;
    if (throttleScopePage) throttleScopePage.checked = !!scopes.page;
  }

  function updateSelectedThrottleScopes() {
    var entry = throttleProfiles.find(function(item) { return item.id === selectedThrottleId; });
    if (!entry) return;
    entry.scopes = normalizeThrottleScopes({
      replay: throttleScopeReplay ? throttleScopeReplay.checked : true,
      mock: throttleScopeMock ? throttleScopeMock.checked : false,
      page: throttleScopePage ? throttleScopePage.checked : false
    });
    persistThrottleProfiles();
    showToast('弱网作用域已更新');
  }

  function showConfigModal(mode, entry) {
    configModalMode = mode;
    configEditingId = entry && entry.id ? entry.id : '';
    if (!configModalOverlay || !configModalBody) return;
    if (mode === 'throttle') {
      configModalTitle.textContent = entry ? '编辑弱网预设' : '新建弱网预设';
      var scopes = normalizeThrottleScopes(entry && entry.scopes);
      configModalBody.innerHTML =
        '<div class="config-form">' +
          '<label class="config-form-label">' + helpLabel('名称', '给这套弱网参数起个容易识别的名字，比如“地铁弱网”或“海外接口慢网”。') + '<input class="form-input" id="cfgThrottleName" value="' + escAttr((entry && entry.name) || '') + '" placeholder="比如: 测试弱网 1"></label>' +
          '<div class="config-form-grid">' +
            '<label class="config-form-label">' + helpLabel('延迟 (ms)', '每个请求固定多等多久再发送。1000 ms 等于 1 秒；想模拟“接口慢”，可以先填 500-2000。填 0 表示不加固定延迟。') + '<input class="form-input" id="cfgThrottleLatency" type="number" min="0" value="' + escAttr(String((entry && entry.latency) || 0)) + '"></label>' +
            '<label class="config-form-label">' + helpLabel('抖动 (±ms)', '设置：延迟 = 1000 ms、抖动 = 300 ms。每次请求不会都固定等 1000 ms，而是大概在这个范围里随机：700 ms ~ 1300 ms。') + '<input class="form-input" id="cfgThrottleJitter" type="number" min="0" value="' + escAttr(String((entry && entry.jitterMs) || 0)) + '"></label>' +
          '</div>' +
          '<div class="config-form-grid">' +
            '<label class="config-form-label">' + helpLabel('下行 (kbps)', '下载速度，也就是接口响应回来的速度。数值越小越慢；400 像慢 3G，1600 像较快 3G。填 0 表示不限制。') + '<input class="form-input" id="cfgThrottleDown" type="number" min="0" value="' + escAttr(String((entry && entry.downloadKbps) || 0)) + '"></label>' +
            '<label class="config-form-label">' + helpLabel('上行 (kbps)', '上传速度，也就是请求体发出去的速度。上传图片、表单、大 JSON 时会明显。填 0 表示不限制。') + '<input class="form-input" id="cfgThrottleUp" type="number" min="0" value="' + escAttr(String((entry && entry.uploadKbps) || 0)) + '"></label>' +
          '</div>' +
          '<div class="config-scope-box">' +
            '<div class="config-scope-title">' + helpLabel('作用域', '决定这套弱网参数影响哪里。建议默认只开 Replay；只有要验证 Mock 接口或整页请求时，再打开对应开关。') + '</div>' +
            '<div class="config-scope-toggle"><span><strong>Replay ' + helpIcon('只影响 Replay 页面的“发送请求”。适合安全地调试单个接口，不会干扰当前网页其它请求。') + '</strong><em>仅影响 Replay 页面的重发请求</em></span><label class="toggle"><input type="checkbox" id="cfgThrottleScopeReplay"' + (scopes.replay ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
            '<div class="config-scope-toggle"><span><strong>Mock ' + helpIcon('只影响已经命中 Mock 规则的接口。适合测试“接口被 Mock 后仍然很慢”的前端表现。') + '</strong><em>仅影响命中 Mock 规则的接口</em></span><label class="toggle"><input type="checkbox" id="cfgThrottleScopeMock"' + (scopes.mock ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
            '<div class="config-scope-toggle"><span><strong>页面全局 ' + helpIcon('影响当前页面脚本发起的 fetch/XHR 接口请求。不会拦截地址栏跳转、普通表单提交、图片、脚本、文档导航等浏览器资源请求。') + '</strong><em>仅影响当前页面的 fetch / XHR 接口</em></span><label class="toggle"><input type="checkbox" id="cfgThrottleScopePage"' + (scopes.page ? ' checked' : '') + '><span class="toggle-slider"></span></label></div>' +
          '</div>' +
          '<div class="config-hint">0 表示不启用该项。页面全局只影响 fetch/XHR 接口，不会影响普通页面跳转或表单搜索。</div>' +
        '</div>';
    }
    configModalOverlay.classList.add('active');
  }

  function hideConfigModal() {
    if (configModalOverlay) configModalOverlay.classList.remove('active');
    configModalMode = '';
    configEditingId = '';
  }

  function saveConfigModal() {
    if (configModalMode === 'throttle') {
      var profile = {
        id: configEditingId || ('thr_' + Date.now() + '_' + random(6)),
        name: (($('cfgThrottleName') || {}).value || '').trim() || '未命名预设',
        latency: Math.max(0, Number((($('cfgThrottleLatency') || {}).value || 0))),
        jitterMs: Math.max(0, Number((($('cfgThrottleJitter') || {}).value || 0))),
        downloadKbps: Math.max(0, Number((($('cfgThrottleDown') || {}).value || 0))),
        uploadKbps: Math.max(0, Number((($('cfgThrottleUp') || {}).value || 0))),
        scopes: {
          replay: !!(($('cfgThrottleScopeReplay') || {}).checked),
          mock: !!(($('cfgThrottleScopeMock') || {}).checked),
          page: !!(($('cfgThrottleScopePage') || {}).checked)
        }
      };
      upsertById(throttleProfiles, normalizeThrottleProfile(profile));
      selectedThrottleId = profile.id;
      persistThrottleProfiles();
      hideConfigModal();
      showToast('弱网预设已保存');
    }
  }

  function upsertById(list, item) {
    var idx = list.findIndex(function(entry) { return entry.id === item.id; });
    if (idx >= 0) list[idx] = item;
    else list.unshift(item);
  }

  // ======================================================================
  // HELPERS
  // ======================================================================

  function genId() {
    return 'rule_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
  }

  function toMockPathPattern(value) {
    var raw = String(value || '').trim();
    if (!/^https?:\/\//i.test(raw)) return raw;
    try {
      var u = new URL(raw);
      return (u.pathname || '/') + (u.search || '');
    } catch (e) {
      return raw;
    }
  }

  function random(n) {
    return Math.random().toString(36).substr(2, n);
  }

  function truncateMiddle(text, maxLen) {
    var value = String(text || '');
    if (value.length <= maxLen) return value;
    var keep = Math.max(8, Math.floor((maxLen - 3) / 2));
    return value.slice(0, keep) + '...' + value.slice(value.length - keep);
  }

  function findReq(id) {
    for (var i = 0; i < requests.length; i++) {
      if (requests[i].id === id) return requests[i];
    }
    return null;
  }

  function objHeaders(arr) {
    var obj = {};
    arr.forEach(function(h) {
      if (!h || !h.name) return;
      obj[h.name.toLowerCase()] = h.value;
    });
    return obj;
  }

  function ruleNameFromUrl(url, method) {
    try {
      var u = new URL(url);
      var parts = u.pathname.split('/').filter(Boolean);
      var last = parts[parts.length - 1] || 'api';
      return method + ' ' + last + ' — ' + parts.slice(-2).join('/');
    } catch(e) { return method + ' ' + url.substring(0, 40); }
  }

  function shortenUrl(url) {
    try {
      var u = new URL(url);
      var path = u.pathname;
      if (u.search) {
        var q = u.search.slice(0, 25);
        if (u.search.length > 25) q += '…';
        path += q;
      }
      return path;
    } catch(e) { return url.length > 55 ? url.substring(0, 55) + '…' : url; }
  }

  function displayPath(url) {
    if (!url) return '';
    try {
      var u = new URL(url);
      return u.pathname + u.search;
    } catch(e) {
      return url;
    }
  }

  function displayPathOnly(url) {
    if (!url) return '';
    try {
      var u = new URL(url);
      return u.pathname || '/';
    } catch(e) {
      return String(url || '').split('?')[0];
    }
  }

  function filteredRequests() {
    var q = networkSearchText.trim().toLowerCase();
    return requests.filter(function(req) {
      if (networkFilterType !== 'all' && req.resourceType !== networkFilterType) return false;
      if (!q) return true;
      return displayPath(req.url).toLowerCase().indexOf(q) !== -1 || req.url.toLowerCase().indexOf(q) !== -1;
    });
  }

  function requestType(entry) {
    var resourceType = entry && entry._resourceType ? String(entry._resourceType).toLowerCase() : '';
    var mimeType = entry && entry.response && entry.response.content ? String(entry.response.content.mimeType || '').toLowerCase() : '';
    var url = entry && entry.request ? String(entry.request.url || '').toLowerCase() : '';
    if (resourceType === 'xhr' || resourceType === 'fetch') return 'fetch';
    if (resourceType === 'script' || /\.m?js($|\?)/.test(url) || mimeType.indexOf('javascript') !== -1) return 'js';
    if (resourceType === 'stylesheet' || /\.css($|\?)/.test(url) || mimeType.indexOf('css') !== -1) return 'css';
    if (resourceType === 'image' || mimeType.indexOf('image/') === 0) return 'image';
    if (resourceType === 'font' || mimeType.indexOf('font') !== -1 || /\.(woff2?|ttf|otf|eot)($|\?)/.test(url)) return 'font';
    if (resourceType === 'document' || mimeType.indexOf('text/html') !== -1) return 'document';
    return 'other';
  }

  function requestTypeFromValues(url, mimeType) {
    var lowerUrl = String(url || '').toLowerCase();
    var lowerMime = String(mimeType || '').toLowerCase();
    if (lowerMime.indexOf('javascript') !== -1 || /\.m?js($|\?)/.test(lowerUrl)) return 'js';
    if (lowerMime.indexOf('css') !== -1 || /\.css($|\?)/.test(lowerUrl)) return 'css';
    if (lowerMime.indexOf('image/') === 0) return 'image';
    if (lowerMime.indexOf('font') !== -1 || /\.(woff2?|ttf|otf|eot)($|\?)/.test(lowerUrl)) return 'font';
    if (lowerMime.indexOf('text/html') !== -1) return 'document';
    return 'fetch';
  }

  function normalizeHeaderKeys(headers) {
    var normalized = {};
    Object.keys(headers || {}).forEach(function(key) {
      normalized[key.toLowerCase()] = headers[key];
    });
    return normalized;
  }

  function truncateUrl(url) {
    if (!url) return '(未设置)';
    try {
      var u = new URL(url);
      return u.pathname + u.search;
    } catch(e) { return url.length > 40 ? url.substring(0, 40) + '…' : url; }
  }

  // ====== Find Overlay ======
  var _findMatches = [];
  var _findIdx = -1;

  function doFind(text) {
    clearAllHL();
    _findMatches = [];
    _findIdx = -1;
    var ctx = document.getElementById("findOverlayCount");
    if (!text) { if (ctx) ctx.textContent = "0/0"; return; }
    var t = text.toLowerCase();
    var esc = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    var re = new RegExp("(" + esc + ")", "gi");
    /* Detail elements - highlight with span tag */
    ["detailUrl","detailMethod","detailStatus","detailContentType","detailReqHeaders","detailReqBody","detailResHeaders","detailResBody"].forEach(function(id) {
      var el = document.getElementById(id);
      if (!el || !el.textContent || el.textContent.toLowerCase().indexOf(t) === -1) return;
      if (id === 'detailResBody' && el.classList.contains('is-media')) return;
      var txt = el.textContent;
      el.innerHTML = txt.replace(re, '<span class="find-match">$1</span>');
      var offset = 0;
      while (true) {
        var idx = txt.toLowerCase().indexOf(t, offset);
        if (idx === -1) break;
        _findMatches.push({ el: el, match: txt.substring(idx, idx + text.length), offset: idx });
        offset = idx + 1;
      }
      /* Store span references for precise scrolling */
      var spans = el.querySelectorAll('.find-match');
      for (var si = 0; si < spans.length; si++) {
        var eIdx = _findMatches.length - spans.length + si;
        if (_findMatches[eIdx]) _findMatches[eIdx].span = spans[si];
      }
    });
    /* Table rows - innerHTML highlighting on each cell */
    document.querySelectorAll("#requestBody tr").forEach(function(r) {
      if (r.textContent.toLowerCase().indexOf(t) === -1) return;
      var hasMatch = false;
      r.querySelectorAll("td").forEach(function(td) {
        if (td.textContent.toLowerCase().indexOf(t) === -1) return;
        try {
          var beforeCount = _findMatches.length;
          var html = td.innerHTML;
          var reTD = new RegExp("(" + esc + ")", "gi");
          td.innerHTML = html.replace(reTD, '<span class="find-match">$1</span>');
          td.querySelectorAll('.find-match').forEach(function(span) {
            _findMatches.push({ el: r, span: span, match: span.textContent, offset: beforeCount, isRow: true });
          });
          hasMatch = true;
        } catch(e){}
      });
      if (hasMatch) r.classList.add("find-row");
    });
    _findIdx = _findMatches.length > 0 ? 0 : -1;
    updateFindUI();
    if (_findIdx >= 0) scrollToMatch(_findIdx);
  }

  function clearAllHL() {
    ["detailUrl","detailMethod","detailStatus","detailContentType","detailReqHeaders","detailReqBody","detailResHeaders","detailResBody"].forEach(function(id) {
      var el = document.getElementById(id);
      if (id === 'detailResBody' && el && el.classList.contains('is-media')) return;
      if (el && el.innerHTML !== el.textContent) el.innerHTML = el.textContent;
    });
    document.querySelectorAll('#requestBody td .find-match').forEach(function(s) {
      var tx = document.createTextNode(s.textContent); s.parentNode.replaceChild(tx, s);
    });
    document.querySelectorAll('#requestBody tr.find-row').forEach(function(r) { r.classList.remove('find-row'); });
  }

  function scrollToMatch(idx) {
    if (!_findMatches || idx < 0 || idx >= _findMatches.length) return;
    var m = _findMatches[idx];
    if (m.el && m.el.scrollIntoView) {
      if (m.isRow) {
        m.el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (m.span) {
        /* Scroll both the outer container AND the inner span (for scrollable <pre> blocks) */
        m.el.scrollIntoView({ behavior: "smooth", block: "center" });
        try { m.span.scrollIntoView({ behavior: "smooth", block: "center" }); } catch(e){}
      } else {
        m.el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    updateFindUI();
  }

  function updateFindUI() {
    var total = _findMatches.length;
    var cur = _findIdx >= 0 ? _findIdx + 1 : 0;
    var ctx = document.getElementById("findOverlayCount");
    if (ctx) ctx.textContent = cur + "/" + total;
    document.querySelectorAll("#tabNetwork .find-match").forEach(function(el, i) {
      var current = _findMatches[_findIdx];
      el.classList.toggle("find-active", !!current && current.span === el);
    });
    document.querySelectorAll("#requestBody tr.find-row").forEach(function(r) {
      r.classList.toggle("find-active-row", _findMatches[_findIdx] && _findMatches[_findIdx].el === r);
    });
  }

  function reFind() {
    var inp = document.querySelector("#findOverlay .find-overlay-input");
    if (inp && inp.value) doFind(inp.value);
  }

  /* Find overlay input handler */
  document.addEventListener("input", function(e) {
    if (e.target.closest && e.target.closest("#findOverlay") && e.target.classList.contains("find-overlay-input")) {
      doFind(e.target.value);
    }
  });

  /* Enter key navigation in find overlay */
  document.addEventListener("keydown", function(e) {
    if (isComposingEvent(e)) return;
    var overlay = document.getElementById("findOverlay");
    if (!overlay) return;
    var inp = overlay.querySelector(".find-overlay-input");
    if (e.key === "Enter" && document.activeElement === inp) {
      e.preventDefault();
      if (e.shiftKey) { _findIdx = _findIdx <= 0 ? _findMatches.length - 1 : _findIdx - 1; }
      else { _findIdx = _findIdx >= _findMatches.length - 1 ? 0 : _findIdx + 1; }
      scrollToMatch(_findIdx);
    }
    if (e.key === "Escape" && document.activeElement === inp) {
      inp.value = ""; doFind("");
    }
  });

  /* Prev/Next/Close buttons */
  var foPrev = document.getElementById("findOverlayPrev");
  if (foPrev) foPrev.addEventListener("click", function() {
    var oldIdx = _findIdx;
    var inp = document.querySelector("#findOverlay .find-overlay-input");
    if (inp && inp.value) { doFind(inp.value); }
    if (_findMatches.length === 0) return;
    if (oldIdx >= 0 && oldIdx < _findMatches.length) _findIdx = oldIdx;
    _findIdx = _findIdx <= 0 ? _findMatches.length - 1 : _findIdx - 1;
    scrollToMatch(_findIdx);
  });
  var foNext = document.getElementById("findOverlayNext");
  if (foNext) foNext.addEventListener("click", function() {
    var oldIdx = _findIdx;
    var inp = document.querySelector("#findOverlay .find-overlay-input");
    if (inp && inp.value) { doFind(inp.value); }
    if (_findMatches.length === 0) return;
    if (oldIdx >= 0 && oldIdx < _findMatches.length) _findIdx = oldIdx;
    _findIdx = _findIdx >= _findMatches.length - 1 ? 0 : _findIdx + 1;
    scrollToMatch(_findIdx);
  });
  var foClose = document.getElementById("findOverlayClose");
  if (foClose) foClose.addEventListener("click", function() {
    var inp = document.querySelector("#findOverlay .find-overlay-input");
    if (inp) { inp.value = ""; }
    doFind("");
  });

  /* Re-find when showing details (clicking request in list) */
  function statusColor(status) {
    if (status < 200) return '';
    if (status < 300) return 's2xx';
    if (status < 400) return 's3xx';
    if (status < 500) return 's4xx';
    return 's5xx';
  }

  function formatHeaders(headers) {
    var keys = Object.keys(headers);
    if (keys.length === 0) return '(无)';
    return keys.map(function(k) { return k + ': ' + headers[k]; }).join('\n');
  }

  function extractRequestCookies(cookies, cookieHeader) {
    if (Array.isArray(cookies) && cookies.length) return cookies;
    return parseCookieHeader(cookieHeader);
  }

  function extractResponseCookies(cookies, setCookieHeader) {
    if (Array.isArray(cookies) && cookies.length) return cookies;
    return parseSetCookieHeader(setCookieHeader);
  }

  function parseCookieHeader(headerValue) {
    if (!headerValue) return [];
    return String(headerValue).split(';').map(function(part) {
      var idx = part.indexOf('=');
      if (idx <= 0) return null;
      return {
        name: part.slice(0, idx).trim(),
        value: part.slice(idx + 1).trim()
      };
    }).filter(Boolean);
  }

  function parseSetCookieHeader(headerValue) {
    if (!headerValue) return [];
    var lines = Array.isArray(headerValue) ? headerValue : String(headerValue).split(/\r?\n/);
    return lines.map(function(line) {
      var first = String(line).split(';')[0];
      var idx = first.indexOf('=');
      if (idx <= 0) return null;
      return {
        name: first.slice(0, idx).trim(),
        value: first.slice(idx + 1).trim(),
        raw: String(line).trim()
      };
    }).filter(Boolean);
  }

  function buildCookieHeader(cookies) {
    return (cookies || []).map(function(item) {
      return item.name + '=' + item.value;
    }).join('; ');
  }

  function formatCookieLines(cookies) {
    if (!cookies || cookies.length === 0) return '无';
    return cookies.map(function(item) {
      return item.name + '=' + item.value;
    }).join('\n');
  }

  function formatSetCookieLines(cookies) {
    if (!cookies || cookies.length === 0) return '无';
    return cookies.map(function(item) {
      return item.raw || (item.name + '=' + item.value);
    }).join('\n');
  }

  function applyResponseBodyState(req, content, encoding) {
    var body = content || '';
    var mimeType = String(req.mimeType || '').toLowerCase();
    var resHeaders = req.resHeaders || {};
    var contentLength = Number(resHeaders['content-length'] || 0);
    var isBinary = isBinaryMimeType(mimeType) || encoding === 'base64';

    if (body) {
      req.responseBodyState = isBinary ? 'binary' : 'text';
      req.responseBodyMessage = isBinary
        ? '该响应是二进制资源，当前展示的是编码后的原始内容。'
        : '';
      return;
    }

    if (contentLength === 0 || req.status === 204 || req.method === 'HEAD') {
      req.responseBodyState = 'empty';
      req.responseBodyMessage = '该请求没有可返回的响应体。';
      return;
    }

    if (isBinary) {
      req.responseBodyState = 'binary-unavailable';
      req.responseBodyMessage = '该响应是图片或其他二进制资源，浏览器这次没有返回可预览的内容。';
      return;
    }

    if (isStreamingLike(req, mimeType)) {
      req.responseBodyState = 'stream-unavailable';
      req.responseBodyMessage = '该请求更像流式或特殊接口，浏览器未提供完整响应体。';
      return;
    }

    req.responseBodyState = 'unavailable';
    req.responseBodyMessage = '浏览器没有返回这条请求的响应体，通常是受资源类型、跨域策略或 DevTools 能力限制影响。';
  }

  function formatResponseBodyDisplay(req, mimeType) {
    if (!req) return '(空)';
    var state = req.responseBodyState || '';
    if (req.responseContent) {
      if (state === 'binary' || req.responseEncoding === 'base64') {
        return formatBinaryBody(req);
      }
      return formatBody(req.responseContent, mimeType);
    }
    if (state === 'pending') return '响应体获取中...';
    if (state === 'empty') return req.responseBodyMessage || '(空)';
    return req.responseBodyMessage || '(未获取到响应体)';
  }

  function buildMediaPreview(req, mimeType) {
    if (!req) return '';
    var mediaKind = getMediaKind(req, mimeType);
    if (!mediaKind) return '';
    var previewSrc = buildMediaPreviewSrc(req, mimeType);
    var openUrl = req.url || '';
    var note = '';
    if (!previewSrc && openUrl) {
      previewSrc = openUrl;
      note = mediaKind === 'video' || mediaKind === 'audio'
        ? '当前直接使用原始资源地址预览，适合较大的媒体文件。'
        : '当前直接使用原始资源地址预览。';
    }
    if (!previewSrc) return '';

    var mediaHtml = '';
    if (mediaKind === 'image') {
      mediaHtml = '<img class="response-preview-image" src="' + escAttr(previewSrc) + '" alt="响应图片预览">';
    } else if (mediaKind === 'video') {
      mediaHtml = '<video class="response-preview-video" controls preload="metadata" src="' + escAttr(previewSrc) + '"></video>';
      if (!note) note = '如果视频较大或为分片流媒体，播放器可能依赖原始地址继续分段加载。';
    } else if (mediaKind === 'audio') {
      mediaHtml = '<audio class="response-preview-audio" controls preload="metadata" src="' + escAttr(previewSrc) + '"></audio>';
      if (!note) note = '音频资源会优先尝试直接播放。';
    }

    var sourceLabel = req.responseEncoding === 'base64' && req.responseContent ? 'base64 响应体' : '原始资源地址';
    var parts = [
      '<div class="response-preview">',
      '<div class="response-preview-meta">已识别为' + escHtml(mediaKind === 'image' ? '图片' : (mediaKind === 'video' ? '视频' : '音频')) + '资源，当前使用 ' + escHtml(sourceLabel) + ' 预览。</div>',
      mediaHtml,
      '<div class="response-preview-actions">' +
        '<a class="response-preview-link" href="' + escAttr(openUrl || previewSrc) + '" target="_blank" rel="noopener noreferrer">打开资源</a>' +
        '<button type="button" class="response-preview-link copy-resource-url" data-url="' + escAttr(openUrl || previewSrc) + '">复制地址</button>' +
      '</div>'
    ];
    if (note) parts.push('<div class="response-preview-note">' + escHtml(note) + '</div>');
    if (req.responseEncoding === 'base64' && req.responseContent) {
      parts.push('<pre class="response-preview-code">' + escHtml(req.responseContent) + '</pre>');
    } else if (req.responseBodyMessage && req.responseBodyState !== 'text') {
      parts.push('<div class="response-preview-note">' + escHtml(req.responseBodyMessage) + '</div>');
    }
    parts.push('</div>');
    return parts.join('');
  }

  function buildMediaPreviewSrc(req, mimeType) {
    if (req.responseEncoding === 'base64' && req.responseContent) {
      var safeMime = mimeType && mimeType !== '-' ? mimeType : (req.mimeType || 'application/octet-stream');
      return 'data:' + safeMime + ';base64,' + req.responseContent;
    }
    return req.url || '';
  }

  function getMediaKind(req, mimeType) {
    var lowerMime = String(mimeType || req.mimeType || '').toLowerCase();
    var url = String(req.url || '').toLowerCase();
    if (lowerMime.indexOf('image/') === 0 || /\.(png|jpe?g|gif|webp|bmp|svg)(\?|#|$)/.test(url)) return 'image';
    if (lowerMime.indexOf('video/') === 0 || /\.(mp4|webm|mov|m4v|ogg)(\?|#|$)/.test(url)) return 'video';
    if (lowerMime.indexOf('audio/') === 0 || /\.(mp3|wav|aac|m4a|oga|ogg)(\?|#|$)/.test(url)) return 'audio';
    return '';
  }

  function formatBinaryBody(req) {
    var lines = [
      '[二进制响应]'
    ];
    if (req.mimeType) lines.push('Content-Type: ' + req.mimeType);
    if (req.responseEncoding) lines.push('Encoding: ' + req.responseEncoding);
    if (req.responseContent) lines.push('', req.responseContent);
    return lines.join('\n');
  }

  function isBinaryMimeType(mimeType) {
    if (!mimeType) return false;
    return /^(image|audio|video)\//.test(mimeType) ||
      /application\/octet-stream/.test(mimeType) ||
      /application\/pdf/.test(mimeType) ||
      /font\//.test(mimeType);
  }

  function isStreamingLike(req, mimeType) {
    if (mimeType.indexOf('event-stream') !== -1) return true;
    if (mimeType.indexOf('stream') !== -1) return true;
    var url = String(req.url || '').toLowerCase();
    if (url.indexOf('/stream') !== -1 || url.indexOf('eventstream') !== -1) return true;
    return false;
  }

  function copyTextValue(text, successMessage) {
    if (!text || text === '无') {
      showToast('当前没有可复制的数据', 'error');
      return;
    }
    navigator.clipboard.writeText(text).then(function() {
      showToast(successMessage);
    }).catch(function(error) {
      showToast('复制失败: ' + error.message, 'error');
    });
  }

  document.addEventListener('mouseenter', function(e) {
    var hint = e.target.closest('.time-hint');
    if (!hint || !timeTooltip) return;
    timeTooltip.textContent = formatTimeSourceHint(hint.dataset.timeSource || '');
    timeTooltip.style.display = 'block';
    positionTimeTooltip(e.clientX, e.clientY);
  }, true);

  document.addEventListener('mousemove', function(e) {
    var hint = e.target.closest('.time-hint');
    if (!hint || !timeTooltip || timeTooltip.style.display === 'none') return;
    positionTimeTooltip(e.clientX, e.clientY);
  }, true);

  document.addEventListener('mouseleave', function(e) {
    var hint = e.target.closest('.time-hint');
    if (!hint || !timeTooltip) return;
    timeTooltip.style.display = 'none';
  }, true);

  function positionTimeTooltip(clientX, clientY) {
    if (!timeTooltip) return;
    var gap = 12;
    var maxLeft = window.innerWidth - timeTooltip.offsetWidth - 12;
    var maxTop = window.innerHeight - timeTooltip.offsetHeight - 12;
    var left = Math.min(clientX + gap, maxLeft);
    var top = Math.min(clientY + gap, maxTop);
    timeTooltip.style.left = Math.max(12, left) + 'px';
    timeTooltip.style.top = Math.max(12, top) + 'px';
  }

  function formatBody(body, mimeType) {
    if (!body) return '(空)';
    if (mimeType && mimeType.indexOf('json') !== -1) {
      try { return JSON.stringify(JSON.parse(body), null, 2); } catch(e) { return body; }
    }
    return body;
  }

  function escHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function escAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function clampNumber(value, min, max) {
    value = Number(value);
    if (!isFinite(value)) value = min;
    return Math.min(max, Math.max(min, value));
  }

  function nonNegativeNumber(value) {
    value = Number(value);
    if (!isFinite(value) || value < 0) return 0;
    return value;
  }

  function waitMs(ms) {
    return new Promise(function(resolve) {
      setTimeout(resolve, Math.max(0, Number(ms) || 0));
    });
  }

  function formatDateTime(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    var hh = String(date.getHours()).padStart(2, '0');
    var mm = String(date.getMinutes()).padStart(2, '0');
    var ss = String(date.getSeconds()).padStart(2, '0');
    return y + '-' + m + '-' + d + ' ' + hh + ':' + mm + ':' + ss;
  }

  function showToast(msg, type) {
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast ' + (type === 'error' ? 'error' : 'success') + ' show';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function() { toast.classList.remove('show'); }, 2500);
  }

  function showAppDialog(options) {
    options = options || {};
    return new Promise(function(resolve) {
      var overlay = document.createElement('div');
      overlay.className = 'app-dialog-overlay active';
      var hasInput = options.type === 'prompt';
      var hasSelect = options.type === 'select';
      var selectOptions = Array.isArray(options.options) ? options.options : [];
      overlay.innerHTML =
        '<div class="app-dialog" role="dialog" aria-modal="true">' +
          '<div class="app-dialog-header">' +
            '<div class="app-dialog-title">' + escHtml(options.title || '提示') + '</div>' +
            '<button class="app-dialog-close" type="button" aria-label="关闭">×</button>' +
          '</div>' +
          '<div class="app-dialog-body">' +
            '<div>' + escHtml(options.message || '') + '</div>' +
            (hasInput ? '<input class="app-dialog-input" type="text" value="' + escAttr(options.defaultValue || '') + '">' : '') +
            (hasSelect ? '<input class="app-dialog-input app-dialog-search" type="text" placeholder="搜索分组..." value=""><div class="app-dialog-options"></div>' : '') +
          '</div>' +
          '<div class="app-dialog-footer">' +
            (options.type === 'alert' ? '' : '<button class="btn btn-secondary app-dialog-cancel" type="button">取消</button>') +
            '<button class="btn btn-primary app-dialog-ok" type="button">' + escHtml(options.okText || '确定') + '</button>' +
          '</div>' +
        '</div>';

      var done = false;
      var input = overlay.querySelector('.app-dialog-input');
      var searchInput = overlay.querySelector('.app-dialog-search');
      var optionsBox = overlay.querySelector('.app-dialog-options');
      var selectedValue = selectOptions[0] || '';
      var closeBtn = overlay.querySelector('.app-dialog-close');
      var cancelBtn = overlay.querySelector('.app-dialog-cancel');
      var okBtn = overlay.querySelector('.app-dialog-ok');

      function filteredSelectOptions() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (!query) return selectOptions;
        return selectOptions.filter(function(item) {
          return String(item).toLowerCase().indexOf(query) !== -1;
        });
      }

      function renderSelectOptions() {
        if (!optionsBox) return;
        var list = filteredSelectOptions();
        if (list.indexOf(selectedValue) === -1) selectedValue = list[0] || '';
        if (list.length === 0) {
          optionsBox.innerHTML = '<div class="app-dialog-option-empty">没有匹配的分组</div>';
          return;
        }
        optionsBox.innerHTML = list.map(function(item) {
          return '<button class="app-dialog-option' + (item === selectedValue ? ' active' : '') + '" type="button" data-value="' + escAttr(item) + '">' +
            '<span>' + escHtml(item) + '</span>' +
          '</button>';
        }).join('');
      }

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
        if (e.key === 'Enter' && (!hasInput || document.activeElement === input || document.activeElement === searchInput)) {
          e.preventDefault();
          cleanup(hasSelect ? selectedValue : (hasInput ? input.value : true));
        }
      }

      closeBtn.addEventListener('click', function() {
        cleanup(options.type === 'confirm' ? false : null);
      });
      if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
          cleanup(options.type === 'confirm' ? false : null);
        });
      }
      okBtn.addEventListener('click', function() {
        cleanup(hasSelect ? selectedValue : (hasInput ? input.value : true));
      });
      if (searchInput) {
        searchInput.addEventListener('input', renderSelectOptions);
      }
      if (optionsBox) {
        optionsBox.addEventListener('click', function(e) {
          var option = e.target.closest('.app-dialog-option');
          if (!option) return;
          selectedValue = option.dataset.value || '';
          renderSelectOptions();
        });
        optionsBox.addEventListener('dblclick', function(e) {
          var option = e.target.closest('.app-dialog-option');
          if (!option) return;
          selectedValue = option.dataset.value || '';
          cleanup(selectedValue);
        });
      }
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) cleanup(options.type === 'confirm' ? false : null);
      });

      document.body.appendChild(overlay);
      if (hasSelect) renderSelectOptions();
      document.addEventListener('keydown', onKeyDown, true);
      setTimeout(function() {
        if (searchInput) searchInput.focus();
        else if (input) input.focus();
        else okBtn.focus();
        if (input) input.select();
      }, 0);
    });
  }

  function appConfirm(title, message, okText) {
    return showAppDialog({ type: 'confirm', title: title, message: message, okText: okText || '确定' });
  }

  function appPrompt(title, message, defaultValue) {
    return showAppDialog({ type: 'prompt', title: title, message: message, defaultValue: defaultValue || '', okText: '确定' });
  }

  function appSelect(title, message, options, okText) {
    return showAppDialog({ type: 'select', title: title, message: message, options: options || [], okText: okText || '转移' });
  }

  // ======================================================================
  // INIT
  // ======================================================================

  loadRules();        // Load mock rules
  chrome.storage.local.get('masterEnabled', function(result) {
    var enabled = result.masterEnabled !== false;
    if (masterToggle) masterToggle.checked = enabled;
    if (masterToggleText) masterToggleText.textContent = enabled ? '开启' : '关闭';
    updateMockTabStatus(enabled);
  });
  loadThrottleProfiles();
  loadBeaconConfig();
  loadCookieEntries();
  loadReplayHistory();
  loadCapturedMockRequests();
  restorePanelSplit();
  restoreReplaySplit();
  renderBeaconTab();
  renderCookiesTab();
  renderReplayHistory();
  renderNetworkList(); // Render network tab (empty initially)
  updateBadge();
})();
