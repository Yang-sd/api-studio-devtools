if (typeof ApiStudioCompat === 'undefined' && typeof importScripts === 'function') {
  importScripts('compat.js');
}

// 扩展安装时初始化
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    const result = await storageGet('rules');
    if (!result.rules || result.rules.length === 0) {
      await storageSet({ rules: [] });
    }
  }
});

// 处理来自 devtools panel 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_ALL_RULES' || message.type === 'GET_RULES') {
    storageGet(['rules', 'ruleHits']).then(result => {
      const normalized = normalizeRules(result.rules || []);
      const normalizedHits = pruneRuleHits(normalized.rules, result.ruleHits || {});
      const updates = {};
      if (normalized.changed) updates.rules = normalized.rules;
      if (normalizedHits.changed) updates.ruleHits = normalizedHits.hits;
      if (Object.keys(updates).length > 0) {
        storageSet(updates);
      }
      sendResponse({ rules: normalized.rules });
    });
    return true;
  }

  if (message.type === 'SAVE_RULE') {
    storageGet('rules').then(async (result) => {
      let rules = result.rules || [];
      const rule = normalizeRule(message.rule || {});
      const idx = rules.findIndex(r => r.id === rule.id);
      if (idx >= 0) {
        rules[idx] = rule;
      } else {
        rules.push(rule);
      }
      rules = sortRulesByStaticPriority(rules);
      await storageSet({ rules: rules });
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'DELETE_RULE') {
    storageGet(['rules', 'ruleHits']).then(async (result) => {
      let rules = result.rules || [];
      rules = rules.filter(r => r.id !== message.ruleId);
      const hits = result.ruleHits || {};
      if (message.ruleId) delete hits[message.ruleId];
      await storageSet({ rules: rules, ruleHits: hits });
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'DELETE_RULES') {
    storageGet(['rules', 'ruleHits']).then(async (result) => {
      const ids = new Set(message.ruleIds || []);
      let rules = result.rules || [];
      rules = rules.filter(r => !ids.has(r.id));
      const hits = result.ruleHits || {};
      ids.forEach(id => delete hits[id]);
      await storageSet({ rules: rules, ruleHits: hits });
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'TOGGLE_RULE') {
    storageGet('rules').then(async (result) => {
      let rules = result.rules || [];
      const rule = rules.find(r => r.id === message.ruleId);
      if (rule) {
        rule.enabled = message.enabled;
        await storageSet({ rules: rules });
      }
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'RECORD_MOCK') {
    storageGet('capturedRequests').then(async (result) => {
      const list = result.capturedRequests || [];
      const data = message.data || {};
      list.unshift(data);
      if (list.length > 30) {
        list.length = 30;
      }
      await storageSet({ capturedRequests: list });
      sendResponse({ success: true });
    });
    return true;
  }
});

function storageGet(keys) {
  return ApiStudioCompat.storageGet(keys);
}

function storageSet(values) {
  return ApiStudioCompat.storageSet(values);
}

function normalizeRules(rules) {
  let changed = false;
  const next = rules.map(rule => {
    const normalized = normalizeRule(rule);
    if (normalized !== rule) changed = true;
    return normalized;
  });
  const sorted = sortRulesByStaticPriority(next);
  if (sorted.some((rule, index) => rule !== next[index])) changed = true;
  return { rules: sorted, changed };
}

function pruneRuleHits(rules, hits) {
  const liveIds = new Set((rules || []).map(rule => rule && rule.id).filter(Boolean));
  let changed = false;
  const next = {};
  Object.keys(hits || {}).forEach(id => {
    if (liveIds.has(id)) {
      next[id] = hits[id];
    } else {
      changed = true;
    }
  });
  return { hits: next, changed };
}

function sortRulesByStaticPriority(rules) {
  return (rules || []).map((rule, index) => ({ rule, index })).sort((a, b) => {
    const diff = getStaticRuleScore(b.rule) - getStaticRuleScore(a.rule);
    return diff || a.index - b.index;
  }).map(item => item.rule);
}

function getStaticRuleScore(rule) {
  const urlRule = rule && rule.url ? rule.url : {};
  const matchType = urlRule.matchType || 'contains';
  const pattern = String(urlRule.pattern || '');
  const matchTypeScore = {
    equals: 4000,
    startsWith: 3000,
    regex: 2000,
    contains: 1000
  }[matchType] || 1000;
  const methodScore = rule && rule.method && rule.method !== 'ANY' ? 100 : 0;
  return matchTypeScore + methodScore + pattern.length;
}

function normalizeRule(rule) {
  if (!rule || !rule.url || !rule.url.pattern) return rule;
  const pattern = String(rule.url.pattern || '').trim();
  const pathPattern = urlToPathPattern(pattern);
  if (pathPattern === pattern) return rule;
  return {
    ...rule,
    url: {
      ...rule.url,
      pattern: pathPattern
    }
  };
}

function urlToPathPattern(value) {
  const raw = String(value || '').trim();
  if (!/^https?:\/\//i.test(raw)) return raw;
  try {
    const u = new URL(raw);
    return (u.pathname || '/') + (u.search || '');
  } catch (e) {
    return raw;
  }
}
