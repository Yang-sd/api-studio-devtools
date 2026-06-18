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
  var activeLocale = 'zh';
  var themeMode = 'auto';
  var themeMediaQuery = null;
  var replayHistorySearchText = '';
  var networkSearchText = '';
  var networkFilterType = 'all';
  var latestRequestId = null;
  var highlightedRequestIds = {};
  var selectedRuleIds = {};
  var selectedReplayHistoryIds = {};
  var undoToastSeq = 0;

  // ====== DOM ======
  var $ = function(id) { return document.getElementById(id); };

  function closestEventTarget(event, selector) {
    if (!event || !selector) return null;
    if (typeof event.composedPath === 'function') {
      var path = event.composedPath();
      for (var i = 0; i < path.length; i++) {
        var node = path[i];
        if (node && node.nodeType === 1 && node.matches && node.matches(selector)) return node;
      }
    }
    var target = event.target || null;
    if (!target) return null;
    if (target.nodeType !== 1) target = target.parentElement || target.parentNode || null;
    while (target && target.nodeType === 1) {
      if (target.matches && target.matches(selector)) return target;
      target = target.parentElement;
    }
    return null;
  }

  // Tabs
  var tabNav = document.querySelector('.tab-nav');
  var themeToggleBtn = $('themeToggleBtn');
  var themeToggleIcon = $('themeToggleIcon');
  var themeToggleText = $('themeToggleText');
  var tabMock = $('tabMock');
  var tabNetwork = $('tabNetwork');
  var tabBeacon = $('tabBeacon');
  var tabCookies = $('tabCookies');
  var tabReplay = $('tabReplay');
  var tabQr = $('tabQr');

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
  var requestTableScroll = requestBody ? requestBody.closest('.table-scroll') : null;
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
  var replayBodyType = $('replayBodyType');
  var replayBodyTypeTip = $('replayBodyTypeTip');
  var replayBody = $('replayBody');
  var replayUrlEncodedEditor = $('replayUrlEncodedEditor');
  var replayUrlEncodedRows = $('replayUrlEncodedRows');
  var addReplayUrlEncodedRowBtn = $('addReplayUrlEncodedRowBtn');
  var replayMultipartEditor = $('replayMultipartEditor');
  var replayMultipartRows = $('replayMultipartRows');
  var addReplayMultipartRowBtn = $('addReplayMultipartRowBtn');
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
  // QR
  var qrInput = $('qrInput');
  var qrCanvas = $('qrCanvas');
  var qrEmpty = $('qrEmpty');
  var qrMeta = $('qrMeta');
  var qrStatus = $('qrStatus');
  var qrUseSelectedUrlBtn = $('qrUseSelectedUrlBtn');
  var qrClearBtn = $('qrClearBtn');
  var qrDownloadBtn = $('qrDownloadBtn');
  var qrCopyBtn = $('qrCopyBtn');

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
  var replayBodyDrafts = createEmptyReplayBodyDrafts();
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
  var qrLastResult = null;

  var I18N = {
    zh: {
      'lang.button': 'EN',
      'lang.title': 'Switch to English',
      'theme.auto': '自动',
      'theme.light': '浅色',
      'theme.dark': '深色',
      'theme.toggleTitle': '切换主题，当前为 {mode}',
      'tab.network': '网络',
      'tab.replay': '重放',
      'tab.qr': 'QR',
      'tab.mock': 'Mock',
      'tab.beacon': '埋点',
      'tab.cookies': 'Cookie',
      'status.mockOn': 'Mock 总开关已启用',
      'common.clear': '清空',
      'common.delete': '删除',
      'common.edit': '编辑',
      'common.copy': '复制',
      'common.move': '转移',
      'common.save': '保存',
      'common.cancel': '取消',
      'common.confirm': '确定',
      'common.empty': '无',
      'common.notSent': '(尚未发送)',
      'common.loading': '加载中...',
      'common.searchPage': '在页面中查找...',
      'common.prev': '上一个',
      'common.next': '下一个',
      'common.reset': '重置',
      'common.search': '搜索...',
      'common.selectAll': '全选/取消全选',
      'common.defaultGroup': '默认分组',
      'common.url': 'URL',
      'common.path': 'Path',
      'common.method': 'Method',
      'common.time': 'Time',
      'common.status': 'Status',
      'common.contentType': 'Content-Type',
      'common.select': '选择',
      'common.unnamed': '未命名',
      'common.notSet': '(未设置)',
      'common.emptyText': '(空)',
      'undo.action': '撤回',
      'undo.deletedRule': '已删除规则「{name}」',
      'undo.deletedRules': '已删除 {count} 条规则',
      'undo.deletedGroup': '已删除分组「{name}」',
      'undo.deletedReplay': '已删除保存请求「{name}」',
      'undo.deletedReplays': '已删除 {count} 条保存请求',
      'undo.deletedReplayGroup': '已删除 Replay 分组「{name}」',
      'undo.deletedBeaconCondition': '已删除关注条件',
      'undo.clearedRequests': '已清空网络请求',
      'undo.deletedBeacon': '已删除命中记录',
      'undo.clearedBeacon': '已清空埋点命中',
      'undo.deletedCookiesEntry': '已删除 Cookies 记录',
      'undo.clearedCookies': '已清空 Cookies',
      'mock.batchDelete': '🗑 批量删除',
      'mock.batchDeleteCount': '🗑 删除 {count} 条',
      'mock.newRule': '+ 新建规则',
      'mock.newGroup': '+ 新建分组',
      'mock.searchGroup': '搜索分组...',
      'mock.masterTitle': '全局启用/禁用所有 Mock 规则',
      'mock.on': '开启',
      'mock.off': '关闭',
      'mock.clearHits': '清空计数',
      'mock.stats': '共 {rules} 条规则，{enabled} 条启用',
      'mock.statsShort': '{rules} 条规则，{enabled} 条启用',
      'mock.emptyTitle': '📋 暂无规则',
      'mock.emptyHint': '点击上方按钮或从 Network 标签页导入',
      'mock.emptyNoRules': '暂无 Mock 规则',
      'mock.emptyGroup': '当前分组暂无规则',
      'mock.import': '导入 Mock',
      'mock.imported': '已导入 Mock',
      'mock.unimport': '撤销 Mock',
      'mock.importTo': '导入到 Mock',
      'mock.modalNew': '新建规则',
      'mock.modalEdit': '编辑规则',
      'mock.deleteRuleTitle': '删除规则',
      'mock.ruleName': '规则名称',
      'mock.ruleNamePlaceholder': '例如：用户信息接口',
      'mock.urlPath': 'URL 路径',
      'mock.responseBody': '响应体',
      'mock.unnamedRule': '未命名规则',
      'beacon.import': '导入 Beacon',
      'beacon.imported': '已导入 Beacon',
      'beacon.unimport': '撤销 Beacon',
      'network.count': '{count} 个请求',
      'network.countFiltered': '{visible}/{total} 个请求',
      'network.filterPath': '过滤路径...',
      'network.filterAll': '全部',
      'network.filterImage': '图片',
      'network.filterFont': '字体',
      'network.filterDocument': '文档',
      'network.filterOther': '其他',
      'network.emptyTitle': '暂无捕获的请求',
      'network.emptyHint': '刷新页面即可开始捕获网络请求',
      'network.emptyNoMatch': '没有匹配当前过滤条件的请求',
      'network.selectRequest': '选择左侧请求查看详情',
      'network.importHint': '点击“导入”可快速导入到 Replay / Mock / Beacon / Cookies',
      'network.detailTitle': '请求详情',
      'network.import': '导入',
      'network.copyUrl': '复制',
      'network.resizeHint': '拖动调整左右面板宽度',
      'network.reqHeaders': '请求 Headers',
      'network.reqBody': '请求体',
      'network.resHeaders': '响应 Headers',
      'network.resBody': '响应体',
      'replay.import': '导入 Replay',
      'replay.imported': '已导入 Replay',
      'replay.unimport': '撤销 Replay',
      'replay.emptyTitle': '从 Network 里选择一个请求开始调试',
      'replay.emptyHint': '点击请求详情右上角的“导入 Replay”即可带入',
      'replay.searchGroup': '搜索分组...',
      'replay.newGroup': '+ 新建分组',
      'replay.deleteSelected': '删除选中',
      'replay.deleteCount': '删除 {count} 条',
      'replay.searchSaved': '按保存名称快速检索...',
      'replay.resizeHint': '拖动调整左右区域宽度',
      'replay.noSaved': '还没有保存的请求',
      'replay.noSavedInGroup': '这个分组还没有保存的请求',
      'replay.noSavedMatched': '没有匹配的保存请求',
      'replay.saveRequest': '保存请求',
      'replay.sendRequest': '发送请求',
      'replay.reqHeaders': '请求 Headers',
      'replay.reqBody': '请求体',
      'replay.formatJson': '格式化 JSON',
      'replay.minifyJson': '压缩 JSON',
      'replay.bodyType': '请求体类型',
      'replay.bodyRaw': '原始 / JSON',
      'replay.bodyUrlencoded': '表单 URL Encoded',
      'replay.bodyMultipart': '文件上传 FormData',
      'replay.tipRaw': '适合 JSON、XML、纯文本等原始请求体。',
      'replay.tipUrlencoded': '适合普通表单提交，会按 key=value&key2=value2 发送。',
      'replay.tipMultipart': '适合上传文件或同时提交文本字段，发送时浏览器会自动生成 multipart 边界。',
      'replay.urlencodedHead': '字段会按 application/x-www-form-urlencoded 发送',
      'replay.multipartHead': '字段会按 multipart/form-data 发送，文件需要选择本地文件',
      'replay.addField': '+ 添加字段',
      'replay.fieldName': '字段名',
      'replay.fieldValue': '字段值',
      'replay.text': '文本',
      'replay.file': '文件',
      'replay.noFile': '未选择文件',
      'replay.fileSaved': '已保存文件名: {name}{size}，发送前需要重新选择文件。',
      'replay.fileSelected': '已选择: {name} ({size} bytes)',
      'replay.responseResult': '响应结果',
      'replay.responseHeaders': '响应 Headers',
      'replay.responseBody': '响应体',
      'qr.title': '二维码生成',
      'qr.subtitle': '输入网址、文本、Deep Link 或口令，插件会在本地生成二维码。',
      'qr.content': '内容',
      'qr.placeholder': 'https://example.com 或任意需要扫码的文本',
      'qr.useSelectedUrl': '使用当前请求 URL',
      'qr.emptyHint': '输入内容后会自动生成二维码。',
      'qr.preview': '扫码预览',
      'qr.privacy': '本地生成，不会把内容发送到第三方接口。',
      'qr.copyPng': '复制 PNG',
      'qr.downloadPng': '下载 PNG',
      'qr.emptyPreview': '等待输入内容',
      'qr.generated': '已生成 Version {version}，{bytes} bytes',
      'qr.tooLong': '内容过长，当前最多支持 {max} bytes。',
      'qr.emptyInput': '请输入要生成二维码的内容。',
      'qr.noSelectedUrl': '当前没有选中的 Network 请求 URL。',
      'qr.loadedSelectedUrl': '已带入当前请求 URL',
      'qr.downloaded': '二维码已下载',
      'qr.copySuccess': '二维码 PNG 已复制',
      'qr.copyUnsupported': '当前浏览器不支持复制图片，请使用下载 PNG。',
      'qr.copyFailed': '复制二维码失败: {message}',
      'qr.generatorMissing': '二维码生成器加载失败，请刷新插件页面。',
      'beacon.pathPlaceholder': '监控路径关键字，例如 /track 或 /report',
      'beacon.editConditions': '编辑条件',
      'beacon.collapseConditions': '收起条件',
      'beacon.noConditions': '未设置关注条件',
      'beacon.toggleTitle': '开启后会持续根据当前条件筛选命中的请求',
      'beacon.addCondition': '+ 添加条件',
      'beacon.clearHits': '清空命中',
      'beacon.emptyTitle': '暂无命中的埋点请求',
      'beacon.emptyHint': '输入路径关键字后，会持续筛选当前捕获到的请求',
      'beacon.selectHit': '选择左侧命中项查看详情',
      'beacon.selectHint': '适合盯某一路径的上报请求，再检查其中字段是否包含目标值',
      'beacon.detailTitle': '埋点详情',
      'beacon.copyUrl': '复制 URL',
      'beacon.copyPayload': '复制上报数据',
      'beacon.fieldHit': '字段命中',
      'beacon.fieldValues': '关注字段值',
      'beacon.parsedPayload': '解析后的上报数据',
      'beacon.keyPlaceholder': '关注字段 key，可留空',
      'beacon.valuePlaceholder': '对应 value / 关键词 / 局部 JSON',
      'beacon.matchMode': '匹配模式',
      'beacon.fuzzy': '模糊',
      'beacon.exact': '精确',
      'beacon.deleteCondition': '删除条件',
      'beacon.deleteHit': '删除这条命中',
      'beacon.fieldValueCount': '{count} 个字段值',
      'beacon.conditionsHit': '{hit}/{total} 个条件命中',
      'beacon.noWatchField': '未设置关注字段',
      'beacon.fullText': '全文',
      'beacon.hitTitle': '{count} 条命中',
      'beacon.summaryQuery': 'Query {count} 项',
      'beacon.summaryBody': 'Body {count} 项',
      'beacon.summaryConditionHit': '条件命中 {count} 项',
      'beacon.summaryConditionMiss': '条件未命中',
      'beacon.summaryEmpty': '无可解析字段',
      'cookies.count': '{count} 组 Cookies',
      'cookies.emptyTitle': '暂无 Cookies',
      'cookies.emptyHint': '从 Network 请求详情导入后会显示在这里',
      'cookies.selectTitle': '选择左侧 Cookies 查看详情',
      'cookies.selectHint': '可以单独复制请求 Cookies 或 Set-Cookie',
      'cookies.detailTitle': 'Cookies 详情',
      'cookies.copyCookies': '复制 Cookies',
      'cookies.copySetCookie': '复制 Set-Cookie',
      'cookies.reqCookies': '请求 Cookies',
      'cookies.import': '导入 Cookies',
      'cookies.imported': '已导入 Cookies',
      'cookies.unimport': '撤销 Cookies'
    },
    en: {
      'lang.button': '中文',
      'lang.title': '切换到中文',
      'theme.auto': 'Auto',
      'theme.light': 'Light',
      'theme.dark': 'Dark',
      'theme.toggleTitle': 'Switch theme, current: {mode}',
      'tab.network': 'Network',
      'tab.replay': 'Replay',
      'tab.qr': 'QR',
      'tab.mock': 'Mock',
      'tab.beacon': 'Beacon',
      'tab.cookies': 'Cookies',
      'status.mockOn': 'Mock master switch is enabled',
      'common.clear': 'Clear',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.copy': 'Copy',
      'common.move': 'Move',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.confirm': 'OK',
      'common.empty': 'None',
      'common.notSent': '(Not sent yet)',
      'common.loading': 'Loading...',
      'common.searchPage': 'Find on page...',
      'common.prev': 'Previous',
      'common.next': 'Next',
      'common.reset': 'Reset',
      'common.search': 'Search...',
      'common.selectAll': 'Select all / clear selection',
      'common.defaultGroup': 'Default group',
      'common.url': 'URL',
      'common.path': 'Path',
      'common.method': 'Method',
      'common.time': 'Time',
      'common.status': 'Status',
      'common.contentType': 'Content-Type',
      'common.select': 'Select',
      'common.unnamed': 'Unnamed',
      'common.notSet': '(Not set)',
      'common.emptyText': '(Empty)',
      'undo.action': 'Undo',
      'undo.deletedRule': 'Deleted rule "{name}"',
      'undo.deletedRules': 'Deleted {count} rules',
      'undo.deletedGroup': 'Deleted group "{name}"',
      'undo.deletedReplay': 'Deleted saved request "{name}"',
      'undo.deletedReplays': 'Deleted {count} saved requests',
      'undo.deletedReplayGroup': 'Deleted Replay group "{name}"',
      'undo.deletedBeaconCondition': 'Deleted watch condition',
      'undo.clearedRequests': 'Cleared network requests',
      'undo.deletedBeacon': 'Deleted hit entry',
      'undo.clearedBeacon': 'Cleared beacon hits',
      'undo.deletedCookiesEntry': 'Deleted Cookies entry',
      'undo.clearedCookies': 'Cleared Cookies',
      'mock.batchDelete': '🗑 Batch delete',
      'mock.batchDeleteCount': '🗑 Delete {count}',
      'mock.newRule': '+ New rule',
      'mock.newGroup': '+ New group',
      'mock.searchGroup': 'Search groups...',
      'mock.masterTitle': 'Enable / disable all Mock rules',
      'mock.on': 'On',
      'mock.off': 'Off',
      'mock.clearHits': 'Clear hits',
      'mock.stats': '{rules} rules, {enabled} enabled',
      'mock.statsShort': '{rules} rules, {enabled} enabled',
      'mock.emptyTitle': '📋 No rules yet',
      'mock.emptyHint': 'Create a rule above or import one from Network',
      'mock.emptyNoRules': 'No Mock rules',
      'mock.emptyGroup': 'No rules in this group',
      'mock.import': 'Import Mock',
      'mock.imported': 'Mock imported',
      'mock.unimport': 'Remove Mock',
      'mock.importTo': 'Import to Mock',
      'mock.modalNew': 'New rule',
      'mock.modalEdit': 'Edit rule',
      'mock.deleteRuleTitle': 'Delete rule',
      'mock.ruleName': 'Rule name',
      'mock.ruleNamePlaceholder': 'e.g. User profile API',
      'mock.urlPath': 'URL path',
      'mock.responseBody': 'Response body',
      'mock.unnamedRule': 'Unnamed rule',
      'beacon.import': 'Import Beacon',
      'beacon.imported': 'Beacon imported',
      'beacon.unimport': 'Remove Beacon',
      'network.count': '{count} requests',
      'network.countFiltered': '{visible}/{total} requests',
      'network.filterPath': 'Filter path...',
      'network.filterAll': 'All',
      'network.filterImage': 'Images',
      'network.filterFont': 'Fonts',
      'network.filterDocument': 'Documents',
      'network.filterOther': 'Other',
      'network.emptyTitle': 'No captured requests',
      'network.emptyHint': 'Refresh the page to start capturing network requests',
      'network.emptyNoMatch': 'No requests match the current filter',
      'network.selectRequest': 'Select a request on the left to view details',
      'network.importHint': 'Click Import to send it to Replay / Mock / Beacon / Cookies',
      'network.detailTitle': 'Request details',
      'network.import': 'Import',
      'network.copyUrl': 'Copy',
      'network.resizeHint': 'Drag to resize the panels',
      'network.reqHeaders': 'Request Headers',
      'network.reqBody': 'Request Body',
      'network.resHeaders': 'Response Headers',
      'network.resBody': 'Response Body',
      'replay.import': 'Import Replay',
      'replay.imported': 'Replay imported',
      'replay.unimport': 'Remove Replay',
      'replay.emptyTitle': 'Select a request in Network to start debugging',
      'replay.emptyHint': 'Click “Import Replay” in request details to load it here',
      'replay.searchGroup': 'Search groups...',
      'replay.newGroup': '+ New group',
      'replay.deleteSelected': 'Delete selected',
      'replay.deleteCount': 'Delete {count}',
      'replay.searchSaved': 'Search saved requests...',
      'replay.resizeHint': 'Drag to resize the areas',
      'replay.noSaved': 'No saved requests yet',
      'replay.noSavedInGroup': 'No saved requests in this group',
      'replay.noSavedMatched': 'No saved requests matched',
      'replay.saveRequest': 'Save request',
      'replay.sendRequest': 'Send request',
      'replay.reqHeaders': 'Request Headers',
      'replay.reqBody': 'Request Body',
      'replay.formatJson': 'Format JSON',
      'replay.minifyJson': 'Minify JSON',
      'replay.bodyType': 'Body type',
      'replay.bodyRaw': 'Raw / JSON',
      'replay.bodyUrlencoded': 'Form URL Encoded',
      'replay.bodyMultipart': 'File Upload FormData',
      'replay.tipRaw': 'For raw JSON, XML, or plain text bodies.',
      'replay.tipUrlencoded': 'For classic form submissions sent as key=value&key2=value2.',
      'replay.tipMultipart': 'For files and mixed text fields. The browser will generate the multipart boundary.',
      'replay.urlencodedHead': 'Fields will be sent as application/x-www-form-urlencoded',
      'replay.multipartHead': 'Fields will be sent as multipart/form-data. File fields need a local file.',
      'replay.addField': '+ Add field',
      'replay.fieldName': 'Field name',
      'replay.fieldValue': 'Field value',
      'replay.text': 'Text',
      'replay.file': 'File',
      'replay.noFile': 'No file selected',
      'replay.fileSaved': 'Saved file name: {name}{size}. Please choose the file again before sending.',
      'replay.fileSelected': 'Selected: {name} ({size} bytes)',
      'replay.responseResult': 'Response result',
      'replay.responseHeaders': 'Response Headers',
      'replay.responseBody': 'Response Body',
      'qr.title': 'QR Code Generator',
      'qr.subtitle': 'Enter a URL, text, deep link, or token. API Studio generates the QR code locally.',
      'qr.content': 'Content',
      'qr.placeholder': 'https://example.com or any text you want to scan',
      'qr.useSelectedUrl': 'Use selected request URL',
      'qr.emptyHint': 'Enter content to generate a QR code automatically.',
      'qr.preview': 'Scan preview',
      'qr.privacy': 'Generated locally. Nothing is sent to a third-party service.',
      'qr.copyPng': 'Copy PNG',
      'qr.downloadPng': 'Download PNG',
      'qr.emptyPreview': 'Waiting for content',
      'qr.generated': 'Generated Version {version}, {bytes} bytes',
      'qr.tooLong': 'Content is too long. The current limit is {max} bytes.',
      'qr.emptyInput': 'Enter content to generate a QR code.',
      'qr.noSelectedUrl': 'No Network request URL is currently selected.',
      'qr.loadedSelectedUrl': 'Loaded the selected request URL',
      'qr.downloaded': 'QR code downloaded',
      'qr.copySuccess': 'QR PNG copied',
      'qr.copyUnsupported': 'This browser cannot copy images here. Use Download PNG instead.',
      'qr.copyFailed': 'Failed to copy QR code: {message}',
      'qr.generatorMissing': 'QR generator failed to load. Refresh the extension page.',
      'beacon.pathPlaceholder': 'Path keyword, e.g. /track or /report',
      'beacon.editConditions': 'Edit conditions',
      'beacon.collapseConditions': 'Collapse conditions',
      'beacon.noConditions': 'No watch conditions',
      'beacon.toggleTitle': 'When enabled, captured requests are continuously filtered by the current conditions',
      'beacon.addCondition': '+ Add condition',
      'beacon.clearHits': 'Clear hits',
      'beacon.emptyTitle': 'No matched beacon requests',
      'beacon.emptyHint': 'Enter a path keyword to keep filtering captured requests',
      'beacon.selectHit': 'Select a matched item on the left',
      'beacon.selectHint': 'Useful for watching one reporting path and checking target fields',
      'beacon.detailTitle': 'Beacon details',
      'beacon.copyUrl': 'Copy URL',
      'beacon.copyPayload': 'Copy payload',
      'beacon.fieldHit': 'Field hits',
      'beacon.fieldValues': 'Watched field values',
      'beacon.parsedPayload': 'Parsed payload',
      'beacon.keyPlaceholder': 'Field key, optional',
      'beacon.valuePlaceholder': 'Value / keyword / partial JSON',
      'beacon.matchMode': 'Match mode',
      'beacon.fuzzy': 'Fuzzy',
      'beacon.exact': 'Exact',
      'beacon.deleteCondition': 'Delete condition',
      'beacon.deleteHit': 'Delete this hit',
      'beacon.fieldValueCount': '{count} field values',
      'beacon.conditionsHit': '{hit}/{total} conditions matched',
      'beacon.noWatchField': 'No watched field',
      'beacon.fullText': 'Full text',
      'beacon.hitTitle': '{count} hits',
      'beacon.summaryQuery': 'Query {count}',
      'beacon.summaryBody': 'Body {count}',
      'beacon.summaryConditionHit': '{count} condition hits',
      'beacon.summaryConditionMiss': 'Condition missed',
      'beacon.summaryEmpty': 'No parsed fields',
      'cookies.count': '{count} cookie groups',
      'cookies.emptyTitle': 'No Cookies',
      'cookies.emptyHint': 'Import from Network request details to show them here',
      'cookies.selectTitle': 'Select a Cookies entry on the left',
      'cookies.selectHint': 'Copy request Cookies or Set-Cookie separately',
      'cookies.detailTitle': 'Cookies details',
      'cookies.copyCookies': 'Copy Cookies',
      'cookies.copySetCookie': 'Copy Set-Cookie',
      'cookies.reqCookies': 'Request Cookies',
      'cookies.import': 'Import Cookies',
      'cookies.imported': 'Cookies imported',
      'cookies.unimport': 'Remove Cookies'
    }
  };

  function t(key, params) {
    var dict = I18N[activeLocale] || I18N.zh;
    var fallback = (I18N.zh && I18N.zh[key]) || key;
    var value = dict[key] || fallback;
    params = params || {};
    return String(value).replace(/\{(\w+)\}/g, function(match, name) {
      return params[name] !== undefined ? params[name] : match;
    });
  }

  function tt(zhText, enText, params) {
    var value = activeLocale === 'en' ? enText : zhText;
    params = params || {};
    return String(value).replace(/\{(\w+)\}/g, function(match, name) {
      return params[name] !== undefined ? params[name] : match;
    });
  }

  function normalizeThemeMode(mode) {
    return mode === 'light' || mode === 'dark' || mode === 'auto' ? mode : 'auto';
  }

  function getSystemThemeMode() {
    try {
      if (!window.matchMedia) return 'light';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch (err) {
      return 'light';
    }
  }

  function resolveThemeMode(mode) {
    mode = normalizeThemeMode(mode);
    return mode === 'auto' ? getSystemThemeMode() : mode;
  }

  function updateThemeToggle() {
    if (!themeToggleBtn || !themeToggleText || !themeToggleIcon) return;
    var labelKey = 'theme.' + themeMode;
    var resolved = resolveThemeMode(themeMode);
    themeToggleText.textContent = t(labelKey);
    themeToggleIcon.textContent = themeMode === 'auto' ? '◐' : (resolved === 'dark' ? '☾' : '☀');
    themeToggleBtn.title = t('theme.toggleTitle', { mode: t(labelKey) });
    themeToggleBtn.setAttribute('aria-label', t('theme.toggleTitle', { mode: t(labelKey) }));
  }

  function applyTheme(mode, persist) {
    themeMode = normalizeThemeMode(mode);
    var resolved = resolveThemeMode(themeMode);
    document.documentElement.dataset.theme = resolved;
    if (persist !== false) {
      try { localStorage.setItem('apiStudioTheme', themeMode); } catch (err) {}
    }
    updateThemeToggle();
  }

  function loadThemeMode() {
    try {
      themeMode = normalizeThemeMode(localStorage.getItem('apiStudioTheme') || 'auto');
    } catch (err) {
      themeMode = 'auto';
    }
  }

  function watchThemePreference() {
    if (!window.matchMedia) return;
    try {
      themeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    } catch (err) {
      themeMediaQuery = null;
    }
    if (!themeMediaQuery) return;
    var onThemeChange = function() {
      if (themeMode === 'auto') applyTheme('auto', false);
    };
    if (typeof themeMediaQuery.addEventListener === 'function') {
      themeMediaQuery.addEventListener('change', onThemeChange);
    } else if (typeof themeMediaQuery.addListener === 'function') {
      themeMediaQuery.addListener(onThemeChange);
    }
  }

  function applyLocale() {
    document.documentElement.lang = 'zh-CN';
    document.title = 'API Studio 面板';
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
      el.title = t(el.dataset.i18nTitle);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
      el.placeholder = t(el.dataset.i18nPlaceholder);
    });
    localizeStaticControls();
  }

  function setElementText(id, key, params) {
    var el = $(id);
    if (el) el.textContent = t(key, params);
  }

  function setElementTitle(id, key, params) {
    var el = $(id);
    if (el) el.title = t(key, params);
  }

  function setElementPlaceholder(id, key, params) {
    var el = $(id);
    if (el) el.placeholder = t(key, params);
  }

  function setSelectorText(selector, key, params) {
    var el = document.querySelector(selector);
    if (el) el.textContent = t(key, params);
  }

  function setSelectorPlaceholder(selector, key, params) {
    var el = document.querySelector(selector);
    if (el) el.placeholder = t(key, params);
  }

  function setSectionTitles(containerSelector, keys) {
    var titles = document.querySelectorAll(containerSelector + ' .section-title');
    (keys || []).forEach(function(key, index) {
      if (titles[index]) titles[index].textContent = t(key);
    });
  }

  function setDetailLabels(containerSelector, keys) {
    var labels = document.querySelectorAll(containerSelector + ' .detail-row .label');
    (keys || []).forEach(function(key, index) {
      if (labels[index]) labels[index].textContent = t(key);
    });
  }

  function setReplayBodyTypeOption(value, key) {
    var option = replayBodyType ? replayBodyType.querySelector('option[value="' + value + '"]') : null;
    if (option) option.textContent = t(key);
  }

  function localizeReplayBodyTypeOptions() {
    setReplayBodyTypeOption('raw', 'replay.bodyRaw');
    setReplayBodyTypeOption('urlencoded', 'replay.bodyUrlencoded');
    setReplayBodyTypeOption('multipart', 'replay.bodyMultipart');
    if (replayBodyTypeTip) replayBodyTypeTip.textContent = replayBodyTypeTipText(getReplayBodyType());
  }

  function setFilterText(type, key) {
    var el = filterBar ? filterBar.querySelector('[data-type="' + type + '"]') : null;
    if (el) el.textContent = t(key);
  }

  function localizeStaticControls() {
    setElementText('batchDeleteBtn', 'mock.batchDelete');
    setElementText('mockAddBtn', 'mock.newRule');
    setElementText('addGroupBtn', 'mock.newGroup');
    setElementPlaceholder('groupInput', 'mock.searchGroup');
    setElementText('clearHitsBtn', 'mock.clearHits');
    setElementTitle('toggleAllCb', 'common.selectAll');
    var toggleAllLabel = toggleAllCb ? toggleAllCb.closest('label') : null;
    if (toggleAllLabel) toggleAllLabel.title = t('common.selectAll');
    var masterWrap = masterToggle ? masterToggle.closest('.master-toggle') : null;
    if (masterWrap) masterWrap.title = t('mock.masterTitle');
    if (masterToggleText) masterToggleText.textContent = masterToggle && masterToggle.checked ? t('mock.on') : t('mock.off');

    setElementText('clearBtn', 'common.clear');
    setElementPlaceholder('networkSearchInput', 'network.filterPath');
    setFilterText('all', 'network.filterAll');
    setFilterText('image', 'network.filterImage');
    setFilterText('font', 'network.filterFont');
    setFilterText('document', 'network.filterDocument');
    setFilterText('other', 'network.filterOther');
    var findInputEl = document.querySelector('#findOverlay .find-overlay-input');
    if (findInputEl) findInputEl.placeholder = t('common.searchPage');
    setElementTitle('findOverlayPrev', 'common.prev');
    setElementTitle('findOverlayNext', 'common.next');
    setElementText('findOverlayClose', 'common.reset');
    setElementTitle('panelDivider', 'network.resizeHint');
    setElementText('importBeaconBtn', 'beacon.import');
    setElementText('importReplayBtn', 'replay.import');
    setElementText('importMockBtn', 'mock.import');
    setElementText('importCookiesBtn', 'cookies.import');
    setElementText('copyDetailUrlBtn', 'network.copyUrl');
    setSelectorText('#detailContent .detail-header h3', 'network.detailTitle');

    setElementPlaceholder('beaconPathInput', 'beacon.pathPlaceholder');
    setElementText('addBeaconConditionBtn', 'beacon.addCondition');
    setElementText('clearBeaconBtn', 'beacon.clearHits');
    setElementText('copyBeaconUrlBtn', 'beacon.copyUrl');
    setElementText('copyBeaconPayloadBtn', 'beacon.copyPayload');
    setSelectorText('#beaconDetailContent .detail-header h3', 'beacon.detailTitle');


    setElementText('clearCookiesBtn', 'common.clear');
    setElementText('copyCookiesHeaderBtn', 'cookies.copyCookies');
    setElementText('copyCookiesSetBtn', 'cookies.copySetCookie');
    setElementText('deleteCookiesEntryBtn', 'common.delete');
    setSelectorText('#cookiesDetailContent .detail-header h3', 'cookies.detailTitle');

    var replayHistoryCheckLabel = replayHistoryToggleAll ? replayHistoryToggleAll.closest('label') : null;
    if (replayHistoryCheckLabel) replayHistoryCheckLabel.title = t('common.selectAll');
    setElementPlaceholder('replayGroupInput', 'replay.searchGroup');
    setElementText('addReplayGroupBtn', 'replay.newGroup');
    setElementText('replayBatchDeleteBtn', 'replay.deleteSelected');
    setElementPlaceholder('replayHistorySearchInput', 'replay.searchSaved');
    setElementTitle('replayPanelDivider', 'replay.resizeHint');
    setElementPlaceholder('replayFindInput', 'common.searchPage');
    setElementTitle('replayFindPrev', 'common.prev');
    setElementTitle('replayFindNext', 'common.next');
    setElementText('replayFindClose', 'common.reset');
    setElementText('saveReplayBtn', 'replay.saveRequest');
    setElementText('sendReplayBtn', 'replay.sendRequest');
    setElementText('formatReplayJsonBtn', 'replay.formatJson');
    setElementText('minifyReplayJsonBtn', 'replay.minifyJson');
    setElementText('addReplayUrlEncodedRowBtn', 'replay.addField');
    setElementText('addReplayMultipartRowBtn', 'replay.addField');
    localizeReplayBodyTypeOptions();

    setElementText('cancelModalBtn', 'common.cancel');
    setElementText('deleteRuleBtn', 'common.delete');
    setElementText('saveRuleBtn', 'common.save');
    setElementText('formatJsonBtn', 'replay.formatJson');
    setElementPlaceholder('findInput', 'common.searchPage');
    setElementTitle('findPrevBtn', 'common.prev');
    setElementTitle('findNextBtn', 'common.next');
    updateThemeToggle();
  }

  function detailSectionKey(section) {
    if (!section) return '';
    var body = section.querySelector('.code-block[id]');
    return body ? body.id : '';
  }

  function applyDetailSectionCollapsed(section, collapsed) {
    if (!section) return;
    section.classList.toggle('collapsed', !!collapsed);
    var toggle = section.querySelector('[data-detail-toggle]');
    if (toggle) toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }

  function restoreDetailSectionStates() {
    document.querySelectorAll('#tabNetwork .detail-collapsible').forEach(function(section) {
      var key = detailSectionKey(section);
      if (!key) return;
      try {
        applyDetailSectionCollapsed(section, localStorage.getItem('apiStudioDetailCollapsed:' + key) === '1');
      } catch (e) {}
    });
  }

  document.addEventListener('click', function(e) {
    var toggle = e.target.closest && e.target.closest('[data-detail-toggle]');
    if (!toggle) return;
    var section = toggle.closest('.detail-collapsible');
    if (!section) return;
    var collapsed = !section.classList.contains('collapsed');
    applyDetailSectionCollapsed(section, collapsed);
    var key = detailSectionKey(section);
    if (key) {
      try { localStorage.setItem('apiStudioDetailCollapsed:' + key, collapsed ? '1' : '0'); } catch (err) {}
    }
  });

  restoreDetailSectionStates();

  function rerenderLocalizedViews() {
    renderNetworkList();
    updateBadge();
    if (selectedId) showDetails(selectedId);
    renderRules();
    renderBeaconConditionRows();
    renderBeaconTab();
    renderCookiesTab();
    renderReplayBodyEditor({ forceRows: true });
    renderReplayHistory();
    renderReplayResult(replayRequestId ? findReq(replayRequestId) : null);
    renderQrTab();
    refreshDetailImportState();
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function() {
      var nextMode = themeMode === 'auto' ? 'dark' : (themeMode === 'dark' ? 'light' : 'auto');
      applyTheme(nextMode, true);
      showToast(tt('主题已切换为：{mode}', 'Theme switched to: {mode}', { mode: t('theme.' + themeMode) }));
    });
  }

  // ======================================================================
  // TAB SWITCHING
  // ======================================================================
  if (tabNav) {
    tabNav.addEventListener('click', function(e) {
      var btn = closestEventTarget(e, '.tab');
      if (!btn) return;
      activateTab(btn.dataset.tab);
    });
  }

  function activateTab(tab) {
    document.querySelectorAll('.tab').forEach(function(t) {
      t.classList.toggle('active', t.dataset.tab === tab);
    });
    tabMock.classList.toggle('active', tab === 'mock');
    tabNetwork.classList.toggle('active', tab === 'network');
    if (tabBeacon) tabBeacon.classList.toggle('active', tab === 'beacon');
    if (tabCookies) tabCookies.classList.toggle('active', tab === 'cookies');
    if (tabReplay) tabReplay.classList.toggle('active', tab === 'replay');
    if (tabQr) tabQr.classList.toggle('active', tab === 'qr');
    if (tab === 'mock') loadRules();
    if (tab === 'network') {
      syncImportedState();
      renderNetworkList();
      refreshDetailImportState();
    }
    if (tab === 'beacon') renderBeaconTab();
    if (tab === 'cookies') renderCookiesTab();
    if (tab === 'replay') renderReplayTab();
    if (tab === 'qr') renderQrTab();
  }

  if (qrInput) {
    qrInput.addEventListener('input', function() {
      persistQrText(qrInput.value || '');
      renderQrTab();
    });
  }

  if (qrClearBtn) {
    qrClearBtn.addEventListener('click', function() {
      if (qrInput) qrInput.value = '';
      persistQrText('');
      renderQrTab();
    });
  }

  if (qrUseSelectedUrlBtn) {
    qrUseSelectedUrlBtn.addEventListener('click', function() {
      var req = selectedId ? findReq(selectedId) : null;
      if (!req || !req.url) {
        setQrStatus(t('qr.noSelectedUrl'), 'error');
        showToast(t('qr.noSelectedUrl'), 'error');
        return;
      }
      if (qrInput) qrInput.value = req.url;
      persistQrText(req.url);
      renderQrTab();
      showToast(t('qr.loadedSelectedUrl'));
    });
  }

  if (qrDownloadBtn) qrDownloadBtn.addEventListener('click', downloadQrPng);
  if (qrCopyBtn) qrCopyBtn.addEventListener('click', copyQrPng);

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
    var statsText = activeGroup + ': ' + t('mock.statsShort', { rules: visibleRules.length, enabled: enabled });
    mockStats.textContent = t('mock.statsShort', { rules: visibleRules.length, enabled: enabled });
    mockStats.title = statsText;
    syncBatchState();

    if (visibleRules.length === 0) {
      mockList.appendChild(mockEmpty);
      mockEmpty.textContent = rules.length === 0 ? t('mock.emptyNoRules') : t('mock.emptyGroup');
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
        '<label class="mock-select" data-stop="1" title="' + escAttr(t('common.selectAll')) + '">' +
          '<input type="checkbox" ' + (selectedRuleIds[rule.id] ? 'checked' : '') + '>' +
        '</label>' +
        '<div class="mock-toggle" data-stop="1">' +
          '<label class="toggle"><input type="checkbox" ' + (rule.enabled ? 'checked' : '') + '><span class="toggle-slider"></span></label>' +
        '</div>' +
        '<div class="mock-info">' +
          '<div class="mock-name">' + escHtml(rule.name || t('common.unnamed')) + '</div>' +
          '<div class="mock-meta">' +
            '<span class="mock-method ' + m + '">' + m + '</span>' +
            '<span class="mock-url">' + escHtml(truncateUrl(urlInfo)) + '</span>' +
            '<span class="mock-hits' + (hits > 0 ? ' active' : '') + '" title="Hits"><span class="mock-hit-number">' + hits + '</span><span class="mock-hit-icon" aria-hidden="true">🔥</span></span>' +
          '</div>' +
        '</div>' +
        '<div class="mock-actions">' +
          '<button class="mock-action-link" data-action="edit" data-stop="1" title="' + escAttr(t('common.edit')) + '">' + escHtml(t('common.edit')) + '</button>' +
          '<button class="mock-action-link" data-action="copy" data-stop="1" title="' + escAttr(t('common.copy')) + '">' + escHtml(t('common.copy')) + '</button>' +
          '<button class="mock-action-link" data-action="move" data-stop="1" title="' + escAttr(t('common.move')) + '">' + escHtml(t('common.move')) + '</button>' +
          '<button class="mock-action-link danger" data-action="delete" data-stop="1" title="' + escAttr(t('common.delete')) + '">' + escHtml(t('common.delete')) + '</button>' +
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
      item.querySelector('[data-action="delete"]').addEventListener('click', function(e) {
        e.stopPropagation();
        deleteRule(rule.id);
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
      groupDropdown.innerHTML = '<div class="g-empty">' + escHtml(tt('没有匹配的分组', 'No matching groups')) + '</div>';
      return;
    }
    groupDropdown.innerHTML = filtered.map(function(group) {
      return '<div class="g-item' + (group === activeGroup ? ' active' : '') + '" data-group="' + escAttr(group) + '" title="' + escAttr(group) + '">' +
        '<span class="g-name">' + escHtml(group) + '</span>' +
        (group === DEFAULT_GROUP ? '' : '<span class="g-actions"><button class="g-act g-act-del" data-action="delete-group" title="' + escAttr(tt('删除分组', 'Delete group')) + '" type="button">' + escHtml(t('common.delete')) + '</button></span>') +
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
    showToast(tt('已切换到分组：{name}', 'Switched to group: {name}', { name: next }));
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
      showToast(tt('暂无其他已有分组可转移', 'No other existing groups to move to'), 'error');
      return;
    }

    var target = await appSelect(tt('转移分组', 'Move to group'), tt('选择要转移到的已有分组', 'Choose an existing group to move to'), targets);
    if (target === null) return;
    if (!target) {
      showToast(tt('没有找到这个已有分组', 'This existing group was not found'), 'error');
      return;
    }

    var nextRule = Object.assign({}, rule, { group: target });
    chrome.runtime.sendMessage({ type: 'SAVE_RULE', rule: nextRule }, function() {
      showToast(tt('已转移到分组：{name}', 'Moved to group: {name}', { name: target }));
      loadRules();
    });
  }

  function deleteGroup(name) {
    var group = normalizeGroup(name);
    if (group === DEFAULT_GROUP) {
      showToast(tt('默认分组不能删除', 'The default group cannot be deleted'), 'error');
      return;
    }
    var previousGroups = groups.slice();
    var previousActiveGroup = activeGroup;
    var movedRuleIds = rules.filter(function(rule) {
      return normalizeGroup(rule.group) === group;
    }).map(function(rule) { return rule.id; });
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
      showUndoToast(t('undo.deletedGroup', { name: group }), function() {
        groups = uniqueGroups([DEFAULT_GROUP].concat(previousGroups));
        activeGroup = previousActiveGroup;
        rules.forEach(function(rule) {
          if (movedRuleIds.indexOf(rule.id) !== -1) rule.group = group;
        });
        chrome.storage.local.set({
          rules: rules,
          mockGroups: groups,
          activeMockGroup: activeGroup
        }, function() {
          syncGroupInput();
          renderGroupDropdown();
          renderRules();
        });
      });
    });
  }

  function syncBatchState() {
    var selectedCount = Object.keys(selectedRuleIds).length;
    var visibleCount = rules.filter(function(rule) {
      return normalizeGroup(rule.group) === activeGroup;
    }).length;
    if (batchDeleteBtn) {
      batchDeleteBtn.classList.toggle('show', selectedCount > 0);
      batchDeleteBtn.textContent = selectedCount > 0 ? t('mock.batchDeleteCount', { count: selectedCount }) : t('mock.batchDelete');
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
    modalTitle.textContent = t('mock.modalEdit');
    deleteRuleBtn.style.display = 'block';
    showModal();
  }

  function openCreateModal() {
    resetForm();
    isEditMode = false;
    editingRule = null;
    modalTitle.textContent = t('mock.modalNew');
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
      var name = await appPrompt(tt('新建分组', 'New group'), tt('请输入新分组名称', 'Enter a new group name'), current && current !== activeGroup ? current : '');
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
      showToast(tt('请输入 URL 路径', 'Please enter a URL path'), 'error');
      urlPattern.focus();
      return;
    }

    var body = responseBody.value.trim();
    if (body) { try { body = JSON.stringify(JSON.parse(body)); } catch(e) {} }

    var rule = {
      id: isEditMode ? editingRule.id : genId(),
      name: ruleName.value.trim() || t('mock.unnamedRule'),
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
      showToast(tt('规则已保存', 'Rule saved'));
    });
  }

  function deleteRule(ruleId) {
    var index = rules.findIndex(function(rule) { return rule.id === ruleId; });
    var deletedRule = index >= 0 ? cloneData(rules[index]) : null;
    var deletedHit = deletedRule ? ruleHits[ruleId] : undefined;
    chrome.runtime.sendMessage({ type: 'DELETE_RULE', ruleId: ruleId }, function() {
      delete selectedRuleIds[ruleId];
      if (editingRule && editingRule.id === ruleId) hideModal();
      loadRules();
      if (deletedRule) {
        showUndoToast(t('undo.deletedRule', { name: deletedRule.name || t('common.unnamed') }), function() {
          restoreDeletedRules([{ item: deletedRule, index: index, hit: deletedHit }]);
        });
      }
    });
  }

  function duplicateRule(rule) {
    var copy = JSON.parse(JSON.stringify(rule));
    copy.id = genId();
    copy.name = (rule.name || t('mock.unnamedRule')) + tt(' 副本', ' copy');
    copy.createdAt = Date.now();
    chrome.runtime.sendMessage({ type: 'SAVE_RULE', rule: copy }, function() {
      showToast(tt('已复制规则', 'Rule copied'));
      loadRules();
    });
  }

  deleteRuleBtn.addEventListener('click', function() {
    if (editingRule) deleteRule(editingRule.id);
  });

  if (clearHitsBtn) {
    clearHitsBtn.addEventListener('click', function() {
      chrome.storage.local.set({ ruleHits: {} }, function() {
        ruleHits = {};
        totalHits = 0;
        renderHitSummary();
        renderRules();
        showToast(tt('计数已清空', 'Hit counts cleared'));
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
    batchDeleteBtn.addEventListener('click', function() {
      var ids = Object.keys(selectedRuleIds);
      if (ids.length === 0) return;
      var deleteMap = {};
      ids.forEach(function(id) { deleteMap[id] = true; });
      var deletedEntries = rules.map(function(rule, index) {
        return deleteMap[rule.id] ? { item: cloneData(rule), index: index, hit: ruleHits[rule.id] } : null;
      }).filter(Boolean);
      chrome.runtime.sendMessage({ type: 'DELETE_RULES', ruleIds: ids }, function() {
        selectedRuleIds = {};
        if (editingRule && deleteMap[editingRule.id]) hideModal();
        loadRules();
        showUndoToast(t('undo.deletedRules', { count: deletedEntries.length }), function() {
          restoreDeletedRules(deletedEntries);
        });
      });
    });
  }

  if (masterToggle) {
    masterToggle.addEventListener('change', function() {
      var enabled = !!this.checked;
      chrome.storage.local.set({ masterEnabled: enabled }, function() {
        if (masterToggleText) masterToggleText.textContent = enabled ? t('mock.on') : t('mock.off');
        updateMockTabStatus(enabled);
        showToast(enabled ? tt('Mock 已开启', 'Mock enabled') : tt('Mock 已关闭', 'Mock disabled'));
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
      if (masterToggleText) masterToggleText.textContent = masterEnabled ? t('mock.on') : t('mock.off');
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

  if (chrome.devtools && chrome.devtools.network && chrome.devtools.network.onRequestFinished) {
  chrome.devtools.network.onRequestFinished.addListener(function(entry) {
    var id = 'req_' + Date.now() + '_' + random(6);
    var reqHeaders = (entry.request && entry.request.headers) || [];
    var resHeaders = (entry.response && entry.response.headers) || [];
    var reqHeaderObj = objHeaders(reqHeaders);
    var resHeaderObj = objHeaders(resHeaders);
    var postDataInfo = normalizeEntryPostData(entry.request && entry.request.postData);
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
      postData: postDataInfo.text,
      postDataMimeType: postDataInfo.mimeType,
      postDataParams: postDataInfo.params,
      replayBodyState: replayBodyStateFromPostDataInfo(postDataInfo, headersToEditorText(reqHeaderObj)),
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

    var shouldSelectLatest = !selectedId || selectedId === latestRequestId;
    requests.unshift(req);
    markLatestRequest(req.id);
    if (shouldSelectLatest) selectedId = req.id;
    if (requests.length > 500) requests.length = 500;
    renderNetworkList();
    if (shouldSelectLatest) {
      scrollRequestListToTop();
      showDetails(req.id);
    }
    refreshBeaconForRequest(req);
    updateBadge();
  });
  }

  function refreshBeaconForRequest(req) {
    if (!req || !beaconConfig.enabled || !beaconConfig.path) return;
    if (!isBeaconMatch(req)) return;
    selectedBeaconId = req.id;
    renderBeaconTab();
  }

  function saveToStorage(req) {
    chrome.storage.local.get('capturedRequests', function(result) {
      var list = result.capturedRequests || [];
      var snapshot = {
        id: req.id, url: req.url, method: req.method, status: req.status,
        statusText: req.statusText, headers: req.headers, resHeaders: req.resHeaders,
        totalTimeMs: req.totalTimeMs, timeSource: req.timeSource || '', startedDateTime: req.startedDateTime,
        cookies: req.cookies, setCookies: req.setCookies, postData: req.postData || '',
        postDataMimeType: req.postDataMimeType || '', postDataParams: req.postDataParams || [],
        replayBodyState: req.replayBodyState || null,
        mimeType: req.mimeType, responseContent: req.responseContent,
        responseEncoding: req.responseEncoding || '',
        responseBodyState: req.responseBodyState || '',
        responseBodyMessage: req.responseBodyMessage || '',
        imported: !!req.imported, ruleId: req.ruleId || ''
      };
      var existing = list.find(function(r) { return r.url === req.url && r.method === req.method; });
      if (existing) Object.assign(existing, snapshot);
      else list.unshift(snapshot);
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
        postDataMimeType: item.postDataMimeType || '',
        postDataParams: item.postDataParams || [],
        replayBodyState: item.replayBodyState || null,
        mimeType: mimeType,
        responseContent: item.responseContent || '',
        responseEncoding: item.responseEncoding || '',
        responseBodyState: item.responseContent ? 'text' : 'empty',
        responseBodyMessage: item.responseContent ? '' : tt('(Mock 响应体为空)', '(Mock response body is empty)'),
        resourceType: 'fetch',
        imported: !!item.imported,
        ruleId: item.ruleId || '',
        mocked: true
      };
      if (!latestRequestId) latestRequestId = req.id;
      requests.unshift(req);
    });
    if (requests.length > 500) requests.length = 500;
  }

  function loadCapturedMockRequests() {
    chrome.storage.local.get('capturedRequests', function(result) {
      mergeCapturedMockRequests(result.capturedRequests || []);
      syncLatestRequestFromList();
      renderNetworkList();
      updateBadge();
    });
  }

  function renderNetworkList() {
    if (!requestBody) return;
    syncLatestRequestFromList();
    var visibleRequests = filteredRequests();
    emptyState.style.display = visibleRequests.length === 0 ? 'flex' : 'none';
    if (emptyState) {
      var hint = emptyState.querySelector('.hint');
      if (hint) hint.textContent = requests.length === 0 ? t('network.emptyHint') : t('network.emptyNoMatch');
    }
    requestBody.innerHTML = visibleRequests.map(function(r, index) {
      var classes = [];
      if (r.id === selectedId) classes.push('selected');
      if (r.id === latestRequestId) classes.push('latest-row');
      if (highlightedRequestIds[r.id]) classes.push('just-captured');
      return '<tr class="' + classes.join(' ') + '" data-id="' + r.id + '">' +
        '<td class="col-id">' + (index + 1) + '</td>' +
        '<td class="col-method"><span class="method ' + r.method.toUpperCase() + '">' + r.method + '</span></td>' +
        '<td class="col-url" title="' + escAttr(displayPath(r.url)) + '"><span class="path-cell"><span class="path-cell-text">' + escHtml(displayPathOnly(r.url)) + '</span></span></td>' +
        '<td class="col-action"><button class="imp-btn" data-id="' + r.id + '">' + escHtml(t('network.import')) + '</button></td>' +
        '</tr>';
    }).join('');
  }

  function markLatestRequest(id) {
    latestRequestId = id;
    highlightedRequestIds[id] = true;
    setTimeout(function() {
      if (!highlightedRequestIds[id]) return;
      delete highlightedRequestIds[id];
      renderNetworkList();
    }, 1800);
  }

  function scrollRequestListToTop() {
    if (requestTableScroll) requestTableScroll.scrollTop = 0;
  }

  function resetLatestRequestState() {
    latestRequestId = null;
    highlightedRequestIds = {};
  }

  function syncLatestRequestFromList() {
    if (latestRequestId && requests.some(function(req) { return req.id === latestRequestId; })) return;
    latestRequestId = requests[0] ? requests[0].id : null;
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
        var matchedRule = findImportedRuleForRequest(req);
        req.imported = !!matchedRule;
        req.ruleId = matchedRule ? matchedRule.id : '';
      }
    });
  }

  function hasImportedRuleForRequest(req) {
    return !!findImportedRuleForRequest(req);
  }

  function findImportedRuleForRequest(req) {
    return rules.find(function(rule) {
      return isRuleMatchingRequest(rule, req);
    }) || null;
  }

  function isRuleMatchingRequest(rule, req) {
    if (!rule || !req || !req.url) return false;
    var method = rule.method || 'ANY';
    if (method !== 'ANY' && method !== req.method) return false;
    var pattern = rule.url && rule.url.pattern;
    if (!pattern) return false;
    var candidates = [req.url, displayPath(req.url), toMockPathPattern(req.url)].filter(Boolean);
    return candidates.indexOf(pattern) !== -1;
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
    countBadge.textContent = visibleCount === requests.length ? t('network.count', { count: requests.length }) : t('network.countFiltered', { visible: visibleCount, total: requests.length });
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
      copyTextValue(copyBtn.dataset.url || '', tt('资源地址已复制', 'Resource URL copied'));
    });
  }

  if (copyDetailUrlBtn) {
    copyDetailUrlBtn.addEventListener('click', function() {
      var fullUrl = (($('detailUrlFull') || {}).textContent || '').trim();
      copyTextValue(fullUrl, tt('完整 URL 已复制', 'Full URL copied'));
    });
  }

  if (importReplayBtn) {
    importReplayBtn.addEventListener('click', function() {
      var req = getCurrentDetailRequest();
      if (req) handleImportAction(req, 'replay');
    });
  }

  if (importMockBtn) {
    importMockBtn.addEventListener('click', function() {
      var req = getCurrentDetailRequest();
      if (req) handleImportAction(req, 'mock');
    });
  }

  if (importCookiesBtn) {
    importCookiesBtn.addEventListener('click', function() {
      var req = getCurrentDetailRequest();
      if (req) handleImportAction(req, 'cookies');
    });
  }

  if (importBeaconBtn) {
    importBeaconBtn.addEventListener('click', function() {
      var req = getCurrentDetailRequest();
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
      var previousRequests = requests.map(cloneData);
      var previousSelectedId = selectedId;
      var previousReplayId = replayRequestId;
      var previousBeaconId = selectedBeaconId;
      var previousHighlighted = Object.assign({}, highlightedRequestIds);
      requests.length = 0;
      selectedId = null;
      replayRequestId = null;
      selectedBeaconId = '';
      highlightedRequestIds = {};
      resetLatestRequestState();
      if (detailEmpty) detailEmpty.style.display = 'flex';
      if (detailContent) detailContent.style.display = 'none';
      renderNetworkList();
      renderBeaconTab();
      renderReplayTab();
      updateBadge();
      chrome.storage.local.get('capturedRequests', function(result) {
        var previousStoredRequests = (result.capturedRequests || []).map(cloneData);
        chrome.storage.local.set({ capturedRequests: [] }, function() {
          if (!previousRequests.length && !previousStoredRequests.length) return;
          showUndoToast(t('undo.clearedRequests'), function() {
            requests = previousRequests.map(cloneData);
            selectedId = previousSelectedId;
            replayRequestId = previousReplayId;
            selectedBeaconId = previousBeaconId;
            highlightedRequestIds = Object.assign({}, previousHighlighted);
            chrome.storage.local.set({ capturedRequests: previousStoredRequests.map(cloneData) });
            syncLatestRequestFromList();
            renderNetworkList();
            renderBeaconTab();
            renderReplayTab();
            updateBadge();
            if (selectedId) showDetails(selectedId);
          });
        });
      });
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
    var syncBeaconConditionChanges = function() {
      syncBeaconConditionsFromDom();
      selectedBeaconId = '';
      persistBeaconConfig();
      renderBeaconConditionSummary();
      renderBeaconTab();
    };
    beaconConditions.addEventListener('input', syncBeaconConditionChanges);
    beaconConditions.addEventListener('change', syncBeaconConditionChanges);
    beaconConditions.addEventListener('click', function(e) {
      var btn = e.target.closest('[data-action="delete-beacon-condition"]');
      if (!btn) return;
      var previousConditions = getBeaconConditions();
      var row = btn.closest('.beacon-condition-row');
      if (row) row.remove();
      syncBeaconConditionsFromDom();
      ensureBeaconConditionRows();
      selectedBeaconId = '';
      persistBeaconConfig();
      renderBeaconConditionSummary();
      renderBeaconTab();
      if (previousConditions.length) {
        showUndoToast(t('undo.deletedBeaconCondition'), function() {
          beaconConfig.conditions = previousConditions.map(cloneData);
          beaconConditionsExpanded = true;
          persistBeaconConfig();
          renderBeaconConditionRows();
          renderBeaconTab();
        });
      }
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
      var previousRequests = requests.map(cloneData);
      var previousSelectedId = selectedId;
      var previousBeaconId = selectedBeaconId;
      var previousHighlighted = Object.assign({}, highlightedRequestIds);
      requests.length = 0;
      selectedId = null;
      selectedBeaconId = '';
      highlightedRequestIds = {};
      resetLatestRequestState();
      renderNetworkList();
      renderBeaconTab();
      updateBadge();
      chrome.storage.local.get('capturedRequests', function(result) {
        var previousStoredRequests = (result.capturedRequests || []).map(cloneData);
        chrome.storage.local.set({ capturedRequests: [] }, function() {
          if (!previousRequests.length && !previousStoredRequests.length) return;
          showUndoToast(t('undo.clearedBeacon'), function() {
            requests = previousRequests.map(cloneData);
            selectedId = previousSelectedId;
            selectedBeaconId = previousBeaconId;
            highlightedRequestIds = Object.assign({}, previousHighlighted);
            chrome.storage.local.set({ capturedRequests: previousStoredRequests.map(cloneData) });
            syncLatestRequestFromList();
            renderNetworkList();
            renderBeaconTab();
            updateBadge();
            if (selectedId) showDetails(selectedId);
          });
        });
      });
    });
  }

  if (copyBeaconUrlBtn) {
    copyBeaconUrlBtn.addEventListener('click', function() {
      var match = findBeaconMatch(selectedBeaconId);
      copyTextValue(match ? match.req.url : '', tt('埋点 URL 已复制', 'Beacon URL copied'));
    });
  }

  if (copyBeaconPayloadBtn) {
    copyBeaconPayloadBtn.addEventListener('click', function() {
      var match = findBeaconMatch(selectedBeaconId);
      copyTextValue(match ? match.payloadText : '', tt('上报数据已复制', 'Beacon payload copied'));
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
      var previousEntries = cookieEntries.map(cloneData);
      var previousSelectedId = selectedCookieEntryId;
      cookieEntries = [];
      selectedCookieEntryId = null;
      persistCookieEntries();
      renderCookiesTab();
      if (previousEntries.length) {
        showUndoToast(t('undo.clearedCookies'), function() {
          cookieEntries = previousEntries.map(cloneData);
          selectedCookieEntryId = previousSelectedId;
          persistCookieEntries();
          renderCookiesTab();
        });
      }
    });
  }

  if (copyCookiesHeaderBtn) {
    copyCookiesHeaderBtn.addEventListener('click', function() {
      var entry = cookieEntries.find(function(item) { return item.id === selectedCookieEntryId; });
      copyTextValue(formatCookieLines(entry && entry.cookies), tt('Cookies 已复制', 'Cookies copied'));
    });
  }

  if (copyCookiesSetBtn) {
    copyCookiesSetBtn.addEventListener('click', function() {
      var entry = cookieEntries.find(function(item) { return item.id === selectedCookieEntryId; });
      copyTextValue(formatSetCookieLines(entry && entry.setCookies), tt('Set-Cookie 已复制', 'Set-Cookie copied'));
    });
  }

  if (deleteCookiesEntryBtn) {
    deleteCookiesEntryBtn.addEventListener('click', function() {
      if (!selectedCookieEntryId) return;
      var deletedIndex = cookieEntries.findIndex(function(item) { return item.id === selectedCookieEntryId; });
      var deletedEntry = deletedIndex >= 0 ? cloneData(cookieEntries[deletedIndex]) : null;
      cookieEntries = cookieEntries.filter(function(item) { return item.id !== selectedCookieEntryId; });
      selectedCookieEntryId = cookieEntries[0] ? cookieEntries[0].id : null;
      persistCookieEntries();
      renderCookiesTab();
      if (deletedEntry) {
        showUndoToast(t('undo.deletedCookiesEntry'), function() {
          cookieEntries = insertAt(cookieEntries.filter(function(item) { return item.id !== deletedEntry.id; }), cloneData(deletedEntry), deletedIndex);
          selectedCookieEntryId = deletedEntry.id;
          persistCookieEntries();
          renderCookiesTab();
        });
      }
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
      var name = await appPrompt(tt('新建分组', 'New group'), tt('请输入新分组名称', 'Enter a new group name'), current && current !== activeReplayGroup ? current : '');
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

  if (replayBodyType) {
    replayBodyType.addEventListener('change', function() {
      switchReplayBodyType(this.value);
    });
  }

  if (addReplayUrlEncodedRowBtn) {
    addReplayUrlEncodedRowBtn.addEventListener('click', addReplayUrlEncodedRow);
  }

  if (addReplayMultipartRowBtn) {
    addReplayMultipartRowBtn.addEventListener('click', addReplayMultipartRow);
  }

  if (replayUrlEncodedRows) {
    replayUrlEncodedRows.addEventListener('click', function(e) {
      var deleteBtn = e.target.closest('[data-action="delete-urlencoded-row"]');
      if (!deleteBtn) return;
      var row = deleteBtn.closest('.replay-form-row');
      if (row) row.remove();
      if (!replayUrlEncodedRows.querySelector('.replay-form-row')) renderReplayUrlEncodedRows([{ key: '', value: '' }]);
      syncReplayBodyDraftFromEditor();
      reFindReplayIfNeeded();
    });
    replayUrlEncodedRows.addEventListener('input', function() {
      syncReplayBodyDraftFromEditor();
      reFindReplayIfNeeded();
    });
  }

  if (replayMultipartRows) {
    replayMultipartRows.addEventListener('click', function(e) {
      var deleteBtn = e.target.closest('[data-action="delete-multipart-row"]');
      if (!deleteBtn) return;
      var row = deleteBtn.closest('.replay-form-row');
      if (row) row.remove();
      if (!replayMultipartRows.querySelector('.replay-form-row')) renderReplayMultipartRows([{ key: '', type: 'text', value: '' }]);
      syncReplayBodyDraftFromEditor();
      reFindReplayIfNeeded();
    });
    replayMultipartRows.addEventListener('input', function() {
      syncReplayBodyDraftFromEditor();
      reFindReplayIfNeeded();
    });
    replayMultipartRows.addEventListener('change', function(e) {
      var row = e.target.closest('.replay-form-row');
      if (e.target.matches('[data-role="fieldType"]')) updateReplayMultipartRowMode(row);
      if (e.target.matches('[data-role="file"]')) updateReplayMultipartFileHint(row);
      syncReplayBodyDraftFromEditor();
      reFindReplayIfNeeded();
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
      var idMap = {};
      ids.forEach(function(id) { idMap[id] = true; });
      var deletedEntries = replayHistory.map(function(item, index) {
        return idMap[item.id] ? { item: cloneData(item), index: index } : null;
      }).filter(Boolean);
      replayHistory = replayHistory.filter(function(item) { return !selectedReplayHistoryIds[item.id]; });
      selectedReplayHistoryIds = {};
      persistReplayHistory();
      renderReplayHistory();
      setReplayStatus(tt('已删除 {count} 条保存请求', 'Deleted {count} saved requests', { count: ids.length }), 'success');
      showUndoToast(t('undo.deletedReplays', { count: deletedEntries.length }), function() {
        restoreReplayHistoryEntries(deletedEntries, { group: activeReplayGroup });
        setReplayStatus(tt('已恢复保存请求', 'Saved request restored'), 'success');
      });
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

  [replayMethod, replayUrl, replayHeaders, replayBody, replayBodyType].forEach(function(field) {
    if (!field) return;
    field.addEventListener('input', function() {
      if (field === replayBody) syncReplayBodyDraftFromEditor();
      reFindReplayIfNeeded();
    });
    field.addEventListener('change', function() {
      if (field === replayBody) syncReplayBodyDraftFromEditor();
      reFindReplayIfNeeded();
    });
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
    if (selectedId !== id) {
      selectedId = id;
      renderNetworkList();
    }
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
    renderDetailRequestBody(req);
    setText('detailResHeaders', formatHeaders(req.resHeaders));

    renderResponseBody(req, ct);

    updateImportButton(req);
    reFind();
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
    showToast(tt('Cookies 已导入', 'Cookies imported'));
  }

  function stageReplayRequest(req) {
    if (!req) return;
    replayRequestId = req.id;
    req.replayImported = true;
    renderReplayTab();
    refreshDetailImportState();
    if (hasMultipartFilePlaceholders(replayBodyStateFromRequest(req))) {
      setReplayStatus(tt('已识别文件上传字段；浏览器不允许插件自动回填本地文件，请重新选择文件后再发送。', 'File upload fields detected. Browser extensions cannot auto-fill local files, so choose the files again before sending.'));
    } else {
      setReplayStatus(tt('请求已导入 Replay', 'Request imported to Replay'), 'success');
    }
    showToast(t('replay.imported'));
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
    showToast(tt('已取消导入 Replay', 'Replay import removed'));
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
    if (before !== cookieEntries.length) showToast(tt('已取消导入 Cookies', 'Cookies import removed'));
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
    showToast(t('beacon.imported'));
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
    showToast(tt('已取消导入 Beacon', 'Beacon import removed'));
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
    var mockRule = req.imported ? (req.ruleId ? null : findImportedRuleForRequest(req)) : findImportedRuleForRequest(req);
    if (mockRule && !req.ruleId) {
      req.imported = true;
      req.ruleId = mockRule.id;
    }
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
      importReplayBtn.textContent = states.replay ? t('replay.unimport') : t('replay.import');
      importReplayBtn.classList.toggle('imported', states.replay);
    }
    if (importMockBtn) {
      importMockBtn.textContent = states.mock ? t('mock.unimport') : t('mock.import');
      importMockBtn.classList.toggle('imported', states.mock);
    }
    if (importCookiesBtn) {
      importCookiesBtn.textContent = states.cookies ? t('cookies.unimport') : t('cookies.import');
      importCookiesBtn.classList.toggle('imported', states.cookies);
    }
    if (importBeaconBtn) {
      importBeaconBtn.textContent = states.beacon ? t('beacon.unimport') : t('beacon.import');
      importBeaconBtn.classList.toggle('imported', states.beacon);
    }
    [floatingImportMenu].forEach(function(menu) {
      if (!menu) return;
      menu.querySelectorAll('.import-menu-item').forEach(function(item) {
        var target = item.dataset.importTarget || '';
        if (target === 'replay') item.textContent = states.replay ? t('replay.unimport') : t('replay.import');
        if (target === 'mock') item.textContent = states.mock ? t('mock.unimport') : t('mock.import');
        if (target === 'cookies') item.textContent = states.cookies ? t('cookies.unimport') : t('cookies.import');
        if (target === 'beacon') item.textContent = states.beacon ? t('beacon.unimport') : t('beacon.import');
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
    setText('detailUrlQuery', parts.queryDisplay || tt('(无参数)', '(No query params)'));
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
        queryDisplay: query ? truncateMiddle(query, 120) : tt('(无参数)', '(No query params)')
      };
    } catch (e) {
      return {
        origin: url || '-',
        path: '',
        queryFull: '',
        queryDisplay: tt('(无参数)', '(No query params)')
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

  function renderDetailRequestBody(req) {
    var el = $('detailReqBody');
    if (!el) return;

    var bodyState = req && (req.replayBodyState || replayBodyStateFromRequest(req, buildReplayHeadersText(req)));
    bodyState = normalizeReplayBodyState(bodyState);
    var hasParams = Array.isArray(req && req.postDataParams) && req.postDataParams.length > 0;
    var isFormBody = bodyState.type === 'urlencoded' || bodyState.type === 'multipart';
    var rawBody = String(req && req.postData ? req.postData : '');
    var contentType = String(req && (req.postDataMimeType || getHeaderCaseInsensitive(req.headers || {}, 'content-type') || '')).toLowerCase();

    if (!rawBody && !hasParams && !bodyState.raw && bodyState.type === 'raw') {
      el.innerHTML = '<div class="request-body-empty">' + escHtml(t('common.empty')) + '</div>';
      return;
    }

    if (isFormBody) {
      el.innerHTML = buildStructuredRequestBodyHtml(req, bodyState);
      return;
    }

    if (hasParams) {
      el.innerHTML = buildParamsRequestBodyHtml(req);
      return;
    }

    var rawText = bodyState.raw || rawBody || t('common.empty');
    var displayText = formatRequestBodyText(rawText, contentType);
    el.innerHTML = '<pre class="request-body-raw">' + escHtml(displayText) + '</pre>';
  }

  function formatRequestBodyText(body, mimeType) {
    body = String(body || '');
    mimeType = String(mimeType || '').toLowerCase();
    if (!body) return t('common.empty');
    if (mimeType.indexOf('json') !== -1 || looksLikeJsonText(body)) {
      try {
        return JSON.stringify(JSON.parse(body), null, 2);
      } catch (e) {}
    }
    return body;
  }

  function looksLikeJsonText(text) {
    text = String(text || '').trim();
    if (!text) return false;
    var first = text[0];
    var last = text[text.length - 1];
    return (first === '{' && last === '}') || (first === '[' && last === ']');
  }

  function buildStructuredRequestBodyHtml(req, bodyState) {
    bodyState = normalizeReplayBodyState(bodyState);
    var rows = bodyState.type === 'multipart'
      ? normalizeReplayMultipartRows(bodyState.fields)
      : normalizeReplayUrlEncodedRows(bodyState.fields);
    var contentType = req && (req.postDataMimeType || getHeaderCaseInsensitive(req.headers || {}, 'content-type') || bodyState.type || '');
    var title = bodyState.type === 'multipart' ? tt('表单数据', 'Form Data') : tt('表单字段', 'Form Fields');
    var bodyText = bodyState.raw || String(req && req.postData || '');
    var parts = [];

    parts.push('<div class="request-body-summary">');
    parts.push('<div class="request-body-summary-line">' + escHtml(tt('请求类型: {type}', 'Body type: {type}', { type: title })) + '</div>');
    if (contentType) {
      parts.push('<div class="request-body-summary-line mono">Content-Type: ' + escHtml(String(contentType)) + '</div>');
    }
    parts.push('<div class="request-body-summary-line">' + escHtml(tt('字段数量: {count}', 'Fields: {count}', { count: rows.length })) + '</div>');
    if (bodyState.type === 'multipart') {
      parts.push('<div class="request-body-summary-note">' + escHtml(tt('文件字段会显示文件名，但本地文件内容不会被插件直接展开。', 'File fields show file metadata. The local file contents cannot be expanded by the extension.')) + '</div>');
    }
    parts.push('</div>');

    parts.push('<div class="request-body-table-wrap">');
    parts.push('<table class="request-body-table">');
    parts.push('<thead><tr>');
    parts.push('<th>' + escHtml(tt('字段名', 'Name')) + '</th>');
    parts.push('<th>' + escHtml(tt('类型', 'Type')) + '</th>');
    parts.push('<th>' + escHtml(tt('值', 'Value')) + '</th>');
    parts.push('</tr></thead>');
    parts.push('<tbody>');

    if (!rows.length) {
      parts.push('<tr class="request-body-row-empty"><td colspan="3">' + escHtml(t('common.empty')) + '</td></tr>');
    } else {
      rows.forEach(function(item) {
        parts.push(renderRequestBodyRow(item, bodyState.type));
      });
    }

    parts.push('</tbody></table></div>');

    if (bodyText && bodyState.raw && bodyState.raw !== bodyText && bodyState.type === 'multipart') {
      parts.push('<details class="request-body-raw-toggle">');
      parts.push('<summary>' + escHtml(tt('查看原始 multipart 内容', 'View raw multipart body')) + '</summary>');
      parts.push('<pre class="request-body-raw">' + escHtml(bodyState.raw || bodyText) + '</pre>');
      parts.push('</details>');
    }

    return parts.join('');
  }

  function buildParamsRequestBodyHtml(req) {
    var params = normalizePostDataParams((req && req.postDataParams) || []);
    if (!params.length) return '<div class="request-body-empty">' + escHtml(t('common.empty')) + '</div>';
    var parts = [];
    parts.push('<div class="request-body-summary">');
    parts.push('<div class="request-body-summary-line">' + escHtml(tt('请求类型: 表单字段', 'Body type: Form Fields')) + '</div>');
    if (req && req.postDataMimeType) {
      parts.push('<div class="request-body-summary-line mono">Content-Type: ' + escHtml(req.postDataMimeType) + '</div>');
    }
    parts.push('<div class="request-body-summary-line">' + escHtml(tt('字段数量: {count}', 'Fields: {count}', { count: params.length })) + '</div>');
    parts.push('</div>');
    parts.push('<div class="request-body-table-wrap"><table class="request-body-table"><thead><tr>');
    parts.push('<th>' + escHtml(tt('字段名', 'Name')) + '</th>');
    parts.push('<th>' + escHtml(tt('类型', 'Type')) + '</th>');
    parts.push('<th>' + escHtml(tt('值', 'Value')) + '</th>');
    parts.push('</tr></thead><tbody>');
    params.forEach(function(item) {
      parts.push(renderRequestBodyParamRow(item));
    });
    parts.push('</tbody></table></div>');
    return parts.join('');
  }

  function renderRequestBodyRow(item, bodyType) {
    item = item || {};
    var type = item.type === 'file' ? 'file' : 'text';
    var key = item.key || item.name || '';
    if (type === 'file') return renderRequestBodyFileRow(item, key, bodyType);
    return '<tr class="request-body-row request-body-row-text">' +
      '<td class="request-body-cell request-body-key mono">' + escHtml(key || tt('(未命名字段)', '(Unnamed field)')) + '</td>' +
      '<td class="request-body-cell request-body-type">' + escHtml(tt('文本', 'Text')) + '</td>' +
      '<td class="request-body-cell request-body-value"><span class="request-body-text-value">' + escHtml(String(item.value === undefined || item.value === null ? '' : item.value)) + '</span></td>' +
    '</tr>';
  }

  function renderRequestBodyFileRow(item, key, bodyType) {
    var fileName = replayMultipartFileName(item);
    var fileSize = replayMultipartFileSize(item);
    var contentType = item.contentType || '';
    var fileSizeText = fileSize !== '' && fileSize !== null && fileSize !== undefined ? formatBytesLabel(fileSize) : tt('未知大小', 'Unknown size');
    var typeText = tt('文件', 'File');
    var valueParts = [];
    valueParts.push('<span class="request-body-file-name">' + escHtml(fileName || tt('(未选择文件)', '(No file selected)')) + '</span>');
    valueParts.push('<span class="request-body-file-meta">' + escHtml(tt('二进制文件', 'Binary file')) + '</span>');
    if (fileSizeText) valueParts.push('<span class="request-body-file-meta">' + escHtml(fileSizeText) + '</span>');
    if (contentType) valueParts.push('<span class="request-body-file-meta mono">' + escHtml(contentType) + '</span>');
    return '<tr class="request-body-row request-body-row-file">' +
      '<td class="request-body-cell request-body-key mono">' + escHtml(key || tt('(未命名字段)', '(Unnamed field)')) + '</td>' +
      '<td class="request-body-cell request-body-type">' + escHtml(typeText) + '</td>' +
      '<td class="request-body-cell request-body-value">' + valueParts.join(' ') + '</td>' +
    '</tr>';
  }

  function renderRequestBodyParamRow(item) {
    item = item || {};
    var key = item.key || item.name || '';
    var typeLabel = item.type === 'file' ? tt('文件', 'File') : tt('文本', 'Text');
    var valueHtml;
    if (item.type === 'file') {
      valueHtml = '<span class="request-body-file-name">' + escHtml(item.fileName || item.filename || tt('(未选择文件)', '(No file selected)')) + '</span>' +
        '<span class="request-body-file-meta">' + escHtml(tt('二进制文件', 'Binary file')) + '</span>';
    } else {
      valueHtml = '<span class="request-body-text-value">' + escHtml(String(item.value === undefined || item.value === null ? '' : item.value)) + '</span>';
    }
    return '<tr class="request-body-row">' +
      '<td class="request-body-cell request-body-key mono">' + escHtml(key || tt('(未命名字段)', '(Unnamed field)')) + '</td>' +
      '<td class="request-body-cell request-body-type">' + escHtml(typeLabel) + '</td>' +
      '<td class="request-body-cell request-body-value">' + valueHtml + '</td>' +
    '</tr>';
  }

  function formatBytesLabel(size) {
    var value = Number(size);
    if (!isFinite(value) || value < 0) return '';
    if (value < 1024) return value + ' B';
    if (value < 1024 * 1024) return (value / 1024).toFixed(value % 1024 === 0 ? 0 : 1) + ' KB';
    return (value / (1024 * 1024)).toFixed(value % (1024 * 1024) === 0 ? 0 : 1) + ' MB';
  }

  function fillReplayEditor(req) {
    if (!req) return;
    if (replayMethod) replayMethod.value = (req.method || 'GET').toUpperCase();
    if (replayUrl) replayUrl.value = req.url || '';
    var headersText = buildReplayHeadersText(req);
    if (replayHeaders) replayHeaders.value = headersText;
    applyReplayBodyState(req.replayBodyState || replayBodyStateFromRequest(req, headersText));
  }

  function buildReplayHeadersText(req) {
    var headerText = formatHeaders((req && req.headers) || {}).replace(t('common.empty'), '').replace('(无)', '');
    var postDataMimeType = String((req && req.postDataMimeType) || '').trim();
    if (postDataMimeType && headerText.toLowerCase().indexOf('content-type:') === -1) {
      headerText = (headerText ? headerText + '\n' : '') + 'content-type: ' + postDataMimeType;
    }
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
      setText('replayResultHeaders', t('common.notSent'));
      setText('replayResultBody', t('common.notSent'));
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
    setText('replayResultBody', req.responseContent ? formatBody(req.responseContent, ct) : t('common.notSent'));
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
        applyReplayBodyState(getReplayHistoryBodyState(firstHistory));
        setText('replaySourceText', (firstHistory.method || 'GET') + ' ' + displayPath(firstHistory.url || ''));
      } else {
        setText('replaySourceText', activeReplayGroup || DEFAULT_REPLAY_GROUP);
      }
      renderReplayResult(null);
      renderReplayHistory();
      setReplayStatus('');
      return;
    }
    if (replayEmpty) replayEmpty.style.display = 'none';
    if (replayContent) replayContent.style.display = 'flex';
    fillReplayEditor(req);
    renderReplayResult(req);
    setText('replaySourceText', req.method + ' ' + displayPath(req.url));
    renderReplayHistory();
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

  function createEmptyReplayBodyDrafts() {
    return {
      raw: '',
      urlencoded: [],
      multipart: []
    };
  }

  function normalizeEntryPostData(postData) {
    postData = postData || {};
    var params = normalizePostDataParams(postData.params || []);
    var inferredMimeType = String(postData.mimeType || '').trim();
    if (!inferredMimeType) {
      if (params.some(function(item) { return item.type === 'file' || item.fileName; })) {
        inferredMimeType = 'multipart/form-data';
      } else if (params.length) {
        inferredMimeType = 'application/x-www-form-urlencoded;charset=UTF-8';
      }
    }
    return {
      text: typeof postData.text === 'string' ? postData.text : '',
      mimeType: inferredMimeType,
      params: params
    };
  }

  function normalizePostDataParams(params) {
    return (params || []).map(function(item) {
      item = item || {};
      var value = item.value;
      if (value === undefined || value === null) value = '';
      if (typeof value !== 'string') value = String(value);
      var fileName = String(item.fileName || item.filename || '').trim();
      return {
        key: String(item.name || item.key || '').trim(),
        value: value,
        fileName: fileName,
        contentType: String(item.contentType || '').trim(),
        fileSize: item.fileSize === 0 ? 0 : (item.fileSize || item.size || ''),
        type: fileName ? 'file' : 'text'
      };
    }).filter(function(item) {
      return item.key || item.value || item.fileName;
    });
  }

  function replayBodyStateFromPostDataInfo(postDataInfo, headersText) {
    postDataInfo = postDataInfo || { text: '', mimeType: '', params: [] };
    var headers = parseHeadersText(headersText || '');
    var contentType = String(postDataInfo.mimeType || getHeaderCaseInsensitive(headers, 'content-type') || '').toLowerCase();
    var raw = String(postDataInfo.text || '');
    if (contentType.indexOf('x-www-form-urlencoded') !== -1) {
      var formFields = postDataInfo.params.length ? postDataInfo.params.map(function(item) {
        return { key: item.key, value: item.value };
      }) : parseUrlEncodedRows(raw);
      return normalizeReplayBodyState({ type: 'urlencoded', raw: raw, fields: formFields });
    }
    if (contentType.indexOf('multipart/form-data') !== -1) {
      var multipartFields = postDataInfo.params.length ? postDataInfo.params.map(function(item) {
        return item.type === 'file'
          ? { key: item.key, type: 'file', fileName: item.fileName, fileSize: item.fileSize === 0 ? 0 : (item.fileSize || ''), contentType: item.contentType }
          : { key: item.key, type: 'text', value: item.value === undefined || item.value === null ? '' : item.value };
      }) : parseMultipartRowsFromRaw(raw, headersText || '');
      return normalizeReplayBodyState({ type: 'multipart', raw: raw, fields: multipartFields });
    }
    return normalizeReplayBodyState({ type: 'raw', raw: raw });
  }

  function replayBodyStateFromRequest(req, headersText) {
    req = req || {};
    return replayBodyStateFromPostDataInfo({
      text: req.postData || '',
      mimeType: req.postDataMimeType || '',
      params: req.postDataParams || []
    }, headersText || buildReplayHeadersText(req));
  }

  function hasMultipartFilePlaceholders(state) {
    state = normalizeReplayBodyState(state);
    if (state.type !== 'multipart') return false;
    return (state.fields || []).some(function(item) {
      return item && item.type === 'file';
    });
  }

  function normalizeReplayBodyType(type) {
    return type === 'urlencoded' || type === 'multipart' ? type : 'raw';
  }

  function getReplayBodyType() {
    return normalizeReplayBodyType(replayBodyType ? replayBodyType.value : 'raw');
  }

  function replayBodyTypeTipText(type) {
    if (type === 'urlencoded') return t('replay.tipUrlencoded');
    if (type === 'multipart') return t('replay.tipMultipart');
    return t('replay.tipRaw');
  }

  function syncReplayBodyDraftFromEditor() {
    if (!replayBodyDrafts) replayBodyDrafts = createEmptyReplayBodyDrafts();
    var type = getReplayBodyType();
    if (type === 'raw') {
      replayBodyDrafts.raw = replayBody ? replayBody.value : '';
      return;
    }
    if (type === 'urlencoded') {
      replayBodyDrafts.urlencoded = readReplayUrlEncodedRows();
      return;
    }
    replayBodyDrafts.multipart = readReplayMultipartRows({ includeFiles: true });
  }

  function switchReplayBodyType(type) {
    syncReplayBodyDraftFromEditor();
    type = normalizeReplayBodyType(type);
    if (replayBodyType) replayBodyType.value = type;
    if (type === 'urlencoded' && replayBodyDrafts.urlencoded.length === 0) {
      replayBodyDrafts.urlencoded = parseUrlEncodedRows(replayBodyDrafts.raw || '');
    }
    if (type === 'multipart' && replayBodyDrafts.multipart.length === 0) {
      replayBodyDrafts.multipart = parseMultipartRowsFromRaw(replayBodyDrafts.raw || '', replayHeaders ? replayHeaders.value : '');
    }
    renderReplayBodyEditor();
    reFindReplayIfNeeded();
  }

  function renderReplayBodyEditor(options) {
    options = options || {};
    var type = getReplayBodyType();
    if (!replayBodyDrafts) replayBodyDrafts = createEmptyReplayBodyDrafts();
    if (replayBodyType && replayBodyType.value !== type) replayBodyType.value = type;
    if (replayBodyTypeTip) replayBodyTypeTip.textContent = replayBodyTypeTipText(type);
    if (replayBody) {
      replayBody.hidden = type !== 'raw';
      if (type === 'raw') replayBody.value = replayBodyDrafts.raw || '';
    }
    if (replayUrlEncodedEditor) replayUrlEncodedEditor.hidden = type !== 'urlencoded';
    if (replayMultipartEditor) replayMultipartEditor.hidden = type !== 'multipart';
    if (type === 'urlencoded' && (options.forceRows || !replayUrlEncodedRows || !replayUrlEncodedRows.querySelector('.replay-form-row'))) renderReplayUrlEncodedRows(replayBodyDrafts.urlencoded || []);
    if (type === 'multipart' && (options.forceRows || !replayMultipartRows || !replayMultipartRows.querySelector('.replay-form-row'))) renderReplayMultipartRows(replayBodyDrafts.multipart || []);
    if (formatReplayJsonBtn) formatReplayJsonBtn.disabled = type !== 'raw';
    if (minifyReplayJsonBtn) minifyReplayJsonBtn.disabled = type !== 'raw';
  }

  function applyReplayBodyState(state) {
    var normalized = normalizeReplayBodyState(state);
    replayBodyDrafts = createEmptyReplayBodyDrafts();
    replayBodyDrafts.raw = normalized.raw || '';
    if (normalized.type === 'urlencoded') replayBodyDrafts.urlencoded = normalized.fields.slice();
    if (normalized.type === 'multipart') replayBodyDrafts.multipart = normalized.fields.slice();
    if (replayBodyType) replayBodyType.value = normalized.type;
    renderReplayBodyEditor({ forceRows: true });
  }

  function captureReplayBodyState(options) {
    options = options || {};
    syncReplayBodyDraftFromEditor();
    var type = getReplayBodyType();
    if (type === 'urlencoded') {
      return normalizeReplayBodyState({
        type: 'urlencoded',
        raw: replayBodyStateToText({ type: 'urlencoded', fields: replayBodyDrafts.urlencoded || [] }),
        fields: replayBodyDrafts.urlencoded || []
      });
    }
    if (type === 'multipart') {
      return normalizeReplayBodyState({
        type: 'multipart',
        raw: replayBodyStateToText({ type: 'multipart', fields: replayBodyDrafts.multipart || [] }),
        fields: readReplayMultipartRows({ includeFiles: !!options.includeFiles })
      });
    }
    return normalizeReplayBodyState({ type: 'raw', raw: replayBodyDrafts.raw || '' });
  }

  function normalizeReplayBodyState(state) {
    if (typeof state === 'string') return { type: 'raw', raw: state, fields: [] };
    state = state || {};
    var type = normalizeReplayBodyType(state.type || state.bodyType);
    var raw = state.raw !== undefined ? String(state.raw || '') : String(state.body || '');
    var fields = state.fields || state.bodyFields || [];
    if (type === 'urlencoded') {
      fields = normalizeReplayUrlEncodedRows(fields);
      if (!fields.length && raw) fields = parseUrlEncodedRows(raw);
      raw = fields.length ? replayBodyStateToText({ type: 'urlencoded', fields: fields }) : raw;
    } else if (type === 'multipart') {
      fields = normalizeReplayMultipartRows(fields);
      if (!fields.length && raw) fields = parseMultipartRowsFromRaw(raw, replayHeaders ? replayHeaders.value : '');
    } else {
      type = 'raw';
      fields = [];
    }
    return { type: type, raw: raw, fields: fields };
  }

  function replayBodyStateFromRaw(raw, headersText) {
    raw = String(raw || '');
    var headers = parseHeadersText(headersText || '');
    var contentType = String(getHeaderCaseInsensitive(headers, 'content-type') || '').toLowerCase();
    if (contentType.indexOf('x-www-form-urlencoded') !== -1) {
      return normalizeReplayBodyState({ type: 'urlencoded', raw: raw, fields: parseUrlEncodedRows(raw) });
    }
    if (contentType.indexOf('multipart/form-data') !== -1) {
      return normalizeReplayBodyState({ type: 'multipart', raw: raw, fields: parseMultipartRowsFromRaw(raw, headersText || '') });
    }
    return normalizeReplayBodyState({ type: 'raw', raw: raw });
  }

  function getReplayHistoryBodyState(item) {
    item = item || {};
    var fields = item.bodyFields || [];
    var type = normalizeReplayBodyType(item.bodyType || 'raw');
    if (type === 'raw' && item.headersText) {
      var inferred = replayBodyStateFromRaw(item.body || '', item.headersText || '');
      type = inferred.type;
      fields = inferred.fields;
    }
    if (type === 'urlencoded' && !fields.length && item.body) fields = parseUrlEncodedRows(item.body);
    if (type === 'multipart' && !fields.length && item.body) fields = parseMultipartRowsFromRaw(item.body, item.headersText || '');
    return normalizeReplayBodyState({
      type: type,
      raw: item.body || '',
      fields: fields
    });
  }

  function serializeReplayBodyState(state) {
    var normalized = normalizeReplayBodyState(state);
    return {
      type: normalized.type,
      raw: replayBodyStateToText(normalized),
      fields: normalized.fields.map(function(item) {
        if (normalized.type === 'multipart') {
          return {
            key: item.key || '',
            type: item.type === 'file' ? 'file' : 'text',
            value: item.type === 'file' ? '' : String(item.value === undefined || item.value === null ? '' : item.value),
            fileName: replayMultipartFileName(item),
            fileSize: replayMultipartFileSize(item),
            contentType: item.contentType || ''
          };
        }
        return { key: item.key || '', value: String(item.value || '') };
      })
    };
  }

  function postDataParamsFromReplayBodyState(state) {
    var normalized = normalizeReplayBodyState(state);
    if (normalized.type === 'urlencoded') {
      return normalizeReplayUrlEncodedRows(normalized.fields).map(function(item) {
        return { key: item.key, name: item.key, value: item.value, type: 'text' };
      });
    }
    if (normalized.type === 'multipart') {
      return normalizeReplayMultipartRows(normalized.fields).map(function(item) {
        if (item.type === 'file') {
          var fileName = replayMultipartFileName(item);
          return { key: item.key, name: item.key, value: '', fileName: fileName, filename: fileName, fileSize: replayMultipartFileSize(item), contentType: item.contentType || '', type: 'file' };
        }
        return { key: item.key, name: item.key, value: item.value === undefined || item.value === null ? '' : item.value, type: 'text' };
      });
    }
    return [];
  }

  function replayBodySignature(state) {
    var serialized = serializeReplayBodyState(state);
    return JSON.stringify(serialized);
  }

  function replayBodyStateToText(state) {
    state = state || {};
    var type = normalizeReplayBodyType(state.type || state.bodyType);
    var raw = state.raw !== undefined ? String(state.raw || '') : String(state.body || '');
    var fields = state.fields || state.bodyFields || [];
    if (type === 'urlencoded') {
      var urlencodedRows = normalizeReplayUrlEncodedRows(fields);
      if (!urlencodedRows.length) return raw;
      var params = new URLSearchParams();
      urlencodedRows.forEach(function(item) {
        if (!item.key) return;
        params.append(item.key, item.value === undefined || item.value === null ? '' : item.value);
      });
      return params.toString();
    }
    if (type === 'multipart') {
      var multipartRows = normalizeReplayMultipartRows(fields);
      if (!multipartRows.length) return raw;
      return multipartRows.filter(function(item) {
        return item.key || item.value || replayMultipartFileName(item);
      }).map(function(item) {
        if (item.type === 'file') return (item.key || tt('(未命名字段)', '(Unnamed field)')) + '=@' + (replayMultipartFileName(item) || tt('(未选择文件)', '(No file selected)'));
        return (item.key || tt('(未命名字段)', '(Unnamed field)')) + '=' + String(item.value === undefined || item.value === null ? '' : item.value);
      }).join('\n');
    }
    return raw;
  }

  function readReplayUrlEncodedRows() {
    if (!replayUrlEncodedRows) return [];
    var rows = [];
    replayUrlEncodedRows.querySelectorAll('.replay-form-row').forEach(function(row) {
      var keyInput = row.querySelector('[data-role="key"]');
      var valueInput = row.querySelector('[data-role="value"]');
      var key = keyInput ? keyInput.value.trim() : '';
      var value = valueInput ? valueInput.value : '';
      if (!key && !value) return;
      rows.push({ key: key, value: value });
    });
    return normalizeReplayUrlEncodedRows(rows);
  }

  function readReplayMultipartRows(options) {
    options = options || {};
    if (!replayMultipartRows) return [];
    var rows = [];
    replayMultipartRows.querySelectorAll('.replay-form-row').forEach(function(row) {
      var keyInput = row.querySelector('[data-role="key"]');
      var typeSelect = row.querySelector('[data-role="fieldType"]');
      var valueInput = row.querySelector('[data-role="value"]');
      var fileInput = row.querySelector('[data-role="file"]');
      var key = keyInput ? keyInput.value.trim() : '';
      var type = typeSelect && typeSelect.value === 'file' ? 'file' : 'text';
      var file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
      var fileName = file ? file.name : (row.dataset.fileName || '');
      var fileSize = file ? file.size : (row.dataset.fileSize === '0' ? 0 : (row.dataset.fileSize || ''));
      var contentType = file ? file.type : (row.dataset.contentType || '');
      var value = valueInput ? valueInput.value : '';
      if (!key && !value && !fileName && !file) return;
      var item = { key: key, type: type, value: type === 'text' ? value : '', fileName: fileName, fileSize: fileSize, contentType: contentType };
      if (options.includeFiles && file) item.file = file;
      rows.push(item);
    });
    return normalizeReplayMultipartRows(rows);
  }

  function normalizeReplayUrlEncodedRows(rows) {
    return (rows || []).map(function(item) {
      item = item || {};
      return {
        key: String(item.key || '').trim(),
        value: String(item.value === undefined || item.value === null ? '' : item.value)
      };
    }).filter(function(item) {
      return item.key || item.value;
    });
  }

  function normalizeReplayMultipartRows(rows) {
    return (rows || []).map(function(item) {
      item = item || {};
      var file = item.file || null;
      return {
        key: String(item.key || '').trim(),
        type: item.type === 'file' ? 'file' : 'text',
        value: item.type === 'file' ? '' : String(item.value === undefined || item.value === null ? '' : item.value),
        fileName: file ? file.name : String(item.fileName || ''),
        fileSize: file ? file.size : (item.fileSize === 0 ? 0 : (item.fileSize || '')),
        contentType: file ? file.type : String(item.contentType || ''),
        file: file
      };
    }).filter(function(item) {
      return item.key || item.value || replayMultipartFileName(item);
    });
  }

  function parseUrlEncodedRows(raw) {
    raw = String(raw || '').trim();
    if (!raw || raw.indexOf('=') === -1) return [];
    var rows = [];
    try {
      var params = new URLSearchParams(raw);
      params.forEach(function(value, key) {
        rows.push({ key: key, value: value });
      });
    } catch (e) {
      raw.split('&').forEach(function(pair) {
        if (!pair) return;
        var idx = pair.indexOf('=');
        var key = idx >= 0 ? pair.slice(0, idx) : pair;
        var value = idx >= 0 ? pair.slice(idx + 1) : '';
        try { key = decodeURIComponent(key.replace(/\+/g, ' ')); } catch (err) {}
        try { value = decodeURIComponent(value.replace(/\+/g, ' ')); } catch (err2) {}
        rows.push({ key: key, value: value });
      });
    }
    return normalizeReplayUrlEncodedRows(rows);
  }

  function parseMultipartRowsFromRaw(raw, headersText) {
    raw = String(raw || '');
    if (!raw) return [];
    var headers = parseHeadersText(headersText || '');
    var contentType = String(getHeaderCaseInsensitive(headers, 'content-type') || '');
    var boundaryMatch = contentType.match(/boundary=(?:(?:"([^"]+)")|([^;]+))/i);
    if (!boundaryMatch) return [];
    var boundary = (boundaryMatch[1] || boundaryMatch[2] || '').trim();
    if (!boundary) return [];
    var rows = [];
    raw.split('--' + boundary).forEach(function(part) {
      part = part.replace(/^\r?\n/, '').replace(/\r?\n$/, '');
      if (!part || part === '--') return;
      var separator = part.indexOf('\r\n\r\n');
      var separatorLength = 4;
      if (separator === -1) {
        separator = part.indexOf('\n\n');
        separatorLength = 2;
      }
      if (separator === -1) return;
      var headerText = part.slice(0, separator);
      var body = part.slice(separator + separatorLength).replace(/\r?\n$/, '');
      var dispositionLine = headerText.split(/\r?\n/).find(function(line) {
        return /^content-disposition:/i.test(line);
      }) || '';
      var nameMatch = dispositionLine.match(/name="([^"]*)"/i);
      var fileMatch = dispositionLine.match(/filename="([^"]*)"/i);
      var key = nameMatch ? nameMatch[1] : '';
      if (!key) return;
      if (fileMatch) rows.push({ key: key, type: 'file', fileName: fileMatch[1] || '' });
      else rows.push({ key: key, type: 'text', value: body });
    });
    return normalizeReplayMultipartRows(rows);
  }

  function renderReplayUrlEncodedRows(rows) {
    if (!replayUrlEncodedRows) return;
    rows = normalizeReplayUrlEncodedRows(rows);
    if (!rows.length) rows = [{ key: '', value: '' }];
    replayUrlEncodedRows.innerHTML = rows.map(function(item, index) {
      return '<div class="replay-form-row" data-row-index="' + index + '">' +
        '<input class="form-input" data-role="key" type="text" placeholder="' + escAttr(t('replay.fieldName')) + '" value="' + escAttr(item.key || '') + '">' +
        '<input class="form-input" data-role="value" type="text" placeholder="' + escAttr(t('replay.fieldValue')) + '" value="' + escAttr(item.value || '') + '">' +
        '<button class="btn btn-secondary btn-sm replay-form-delete" data-action="delete-urlencoded-row" type="button">' + escHtml(t('common.delete')) + '</button>' +
      '</div>';
    }).join('');
  }

  function renderReplayMultipartRows(rows) {
    if (!replayMultipartRows) return;
    rows = normalizeReplayMultipartRows(rows);
    if (!rows.length) rows = [{ key: '', type: 'text', value: '' }];
    replayMultipartRows.innerHTML = rows.map(function(item, index) {
      var type = item.type === 'file' ? 'file' : 'text';
      var fileName = replayMultipartFileName(item);
      var fileSize = replayMultipartFileSize(item);
      var fileHint = fileName ? t('replay.fileSaved', { name: fileName, size: fileSize ? ' (' + fileSize + ' bytes)' : '' }) : t('replay.noFile');
      return '<div class="replay-form-row multipart" data-row-index="' + index + '" data-file-name="' + escAttr(fileName) + '" data-file-size="' + escAttr(fileSize) + '" data-content-type="' + escAttr(item.contentType || '') + '">' +
        '<input class="form-input" data-role="key" type="text" placeholder="' + escAttr(t('replay.fieldName')) + '" value="' + escAttr(item.key || '') + '">' +
        '<select class="form-select" data-role="fieldType">' +
          '<option value="text"' + (type === 'text' ? ' selected' : '') + '>' + escHtml(t('replay.text')) + '</option>' +
          '<option value="file"' + (type === 'file' ? ' selected' : '') + '>' + escHtml(t('replay.file')) + '</option>' +
        '</select>' +
        '<div class="replay-form-file-wrap">' +
          '<input class="form-input" data-role="value" type="text" placeholder="' + escAttr(t('replay.fieldValue')) + '" value="' + escAttr(type === 'text' ? (item.value || '') : '') + '"' + (type === 'file' ? ' hidden' : '') + '>' +
          '<div data-role="fileWrap"' + (type === 'file' ? '' : ' hidden') + '>' +
            '<input class="replay-form-file-input" data-role="file" type="file">' +
            '<div class="replay-form-file-hint" data-role="fileHint">' + escHtml(fileHint) + '</div>' +
          '</div>' +
        '</div>' +
        '<button class="btn btn-secondary btn-sm replay-form-delete" data-action="delete-multipart-row" type="button">' + escHtml(t('common.delete')) + '</button>' +
      '</div>';
    }).join('');
  }

  function addReplayUrlEncodedRow() {
    if (!replayUrlEncodedRows) return;
    var index = replayUrlEncodedRows.querySelectorAll('.replay-form-row').length;
    replayUrlEncodedRows.insertAdjacentHTML('beforeend', '<div class="replay-form-row" data-row-index="' + index + '">' +
      '<input class="form-input" data-role="key" type="text" placeholder="' + escAttr(t('replay.fieldName')) + '" value="">' +
      '<input class="form-input" data-role="value" type="text" placeholder="' + escAttr(t('replay.fieldValue')) + '" value="">' +
      '<button class="btn btn-secondary btn-sm replay-form-delete" data-action="delete-urlencoded-row" type="button">' + escHtml(t('common.delete')) + '</button>' +
    '</div>');
    var added = replayUrlEncodedRows.querySelector('.replay-form-row:last-child [data-role="key"]');
    if (added) added.focus();
    syncReplayBodyDraftFromEditor();
  }

  function addReplayMultipartRow() {
    if (!replayMultipartRows) return;
    var index = replayMultipartRows.querySelectorAll('.replay-form-row').length;
    replayMultipartRows.insertAdjacentHTML('beforeend', '<div class="replay-form-row multipart" data-row-index="' + index + '" data-file-name="" data-file-size="" data-content-type="">' +
      '<input class="form-input" data-role="key" type="text" placeholder="' + escAttr(t('replay.fieldName')) + '" value="">' +
      '<select class="form-select" data-role="fieldType"><option value="text" selected>' + escHtml(t('replay.text')) + '</option><option value="file">' + escHtml(t('replay.file')) + '</option></select>' +
      '<div class="replay-form-file-wrap">' +
        '<input class="form-input" data-role="value" type="text" placeholder="' + escAttr(t('replay.fieldValue')) + '" value="">' +
        '<div data-role="fileWrap" hidden><input class="replay-form-file-input" data-role="file" type="file"><div class="replay-form-file-hint" data-role="fileHint">' + escHtml(t('replay.noFile')) + '</div></div>' +
      '</div>' +
      '<button class="btn btn-secondary btn-sm replay-form-delete" data-action="delete-multipart-row" type="button">' + escHtml(t('common.delete')) + '</button>' +
    '</div>');
    var added = replayMultipartRows.querySelector('.replay-form-row:last-child [data-role="key"]');
    if (added) added.focus();
    syncReplayBodyDraftFromEditor();
  }

  function updateReplayMultipartRowMode(row) {
    if (!row) return;
    var typeSelect = row.querySelector('[data-role="fieldType"]');
    var valueInput = row.querySelector('[data-role="value"]');
    var fileWrap = row.querySelector('[data-role="fileWrap"]');
    var isFile = typeSelect && typeSelect.value === 'file';
    if (valueInput) valueInput.hidden = !!isFile;
    if (fileWrap) fileWrap.hidden = !isFile;
  }

  function updateReplayMultipartFileHint(row) {
    if (!row) return;
    var fileInput = row.querySelector('[data-role="file"]');
    var hint = row.querySelector('[data-role="fileHint"]');
    var file = fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
    if (file) {
      row.dataset.fileName = file.name;
      row.dataset.fileSize = String(file.size || 0);
      row.dataset.contentType = file.type || '';
      if (hint) hint.textContent = t('replay.fileSelected', { name: file.name, size: file.size || 0 });
      return;
    }
    if (hint) hint.textContent = row.dataset.fileName ? t('replay.fileSaved', { name: row.dataset.fileName, size: '' }) : t('replay.noFile');
  }

  function replayMultipartFileName(item) {
    if (!item) return '';
    return item.file && item.file.name ? item.file.name : String(item.fileName || '');
  }

  function replayMultipartFileSize(item) {
    if (!item) return '';
    if (item.file && typeof item.file.size === 'number') return item.file.size;
    return item.fileSize === 0 ? 0 : (item.fileSize || '');
  }

  function getHeaderCaseInsensitive(headers, name) {
    var wanted = String(name || '').toLowerCase();
    var found = Object.keys(headers || {}).find(function(key) { return key.toLowerCase() === wanted; });
    return found ? headers[found] : undefined;
  }

  function setHeaderCaseInsensitive(headers, name, value) {
    headers = headers || {};
    var wanted = String(name || '').toLowerCase();
    var found = Object.keys(headers).find(function(key) { return key.toLowerCase() === wanted; });
    if (found) headers[found] = value;
    else headers[name] = value;
  }

  function removeHeaderCaseInsensitive(headers, name) {
    var wanted = String(name || '').toLowerCase();
    Object.keys(headers || {}).forEach(function(key) {
      if (key.toLowerCase() === wanted) delete headers[key];
    });
  }

  function normalizeReplayHeadersForBodyType(headers, type) {
    type = normalizeReplayBodyType(type);
    if (type === 'urlencoded') {
      setHeaderCaseInsensitive(headers, 'Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
    }
    if (type === 'multipart') {
      removeHeaderCaseInsensitive(headers, 'Content-Type');
      removeHeaderCaseInsensitive(headers, 'Content-Length');
    }
  }

  function headersToEditorText(headers) {
    return Object.keys(headers || {}).map(function(key) {
      return key + ': ' + headers[key];
    }).join('\n');
  }

  function buildReplayFetchBody(method, headers, bodyState) {
    var normalized = normalizeReplayBodyState(bodyState);
    var upperMethod = String(method || 'GET').toUpperCase();
    if (upperMethod === 'GET' || upperMethod === 'HEAD') {
      return { body: undefined, preview: '', state: normalized };
    }
    normalizeReplayHeadersForBodyType(headers, normalized.type);
    if (normalized.type === 'urlencoded') {
      var params = new URLSearchParams();
      normalizeReplayUrlEncodedRows(normalized.fields).forEach(function(item) {
        if (!item.key && item.value) throw new Error(tt('表单字段缺少字段名', 'Form field is missing a field name'));
        if (!item.key) return;
        params.append(item.key, item.value || '');
      });
      var encoded = params.toString();
      return { body: encoded ? params : undefined, preview: encoded, state: normalized };
    }
    if (normalized.type === 'multipart') {
      var form = new FormData();
      var previews = [];
      var hasField = false;
      normalizeReplayMultipartRows(normalized.fields).forEach(function(item) {
        if (!item.key) throw new Error(tt('文件上传字段缺少字段名', 'Upload field is missing a field name'));
        if (item.type === 'file') {
          if (!item.file) throw new Error(tt('请选择文件: {key}', 'Please choose a file: {key}', { key: item.key }));
          form.append(item.key, item.file, item.file.name);
          previews.push(item.key + '=@' + item.file.name);
        } else {
          form.append(item.key, item.value || '');
          previews.push(item.key + '=' + String(item.value || ''));
        }
        hasField = true;
      });
      return { body: hasField ? form : undefined, preview: previews.join('\n'), state: normalized };
    }
    return { body: normalized.raw ? normalized.raw : undefined, preview: normalized.raw || '', state: normalized };
  }

  function formatReplayBody(mode) {
    if (getReplayBodyType() !== 'raw') {
      setReplayStatus(tt('只有“原始 / JSON”请求体可以格式化 JSON', 'Only Raw / JSON bodies can be formatted as JSON'), 'error');
      return;
    }
    if (!replayBody || !replayBody.value.trim()) return;
    try {
      var parsed = JSON.parse(replayBody.value);
      replayBody.value = mode === 'minify' ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2);
      syncReplayBodyDraftFromEditor();
      setReplayStatus(mode === 'minify' ? tt('请求体已压缩', 'Request body minified') : tt('请求体已格式化', 'Request body formatted'), 'success');
    } catch(e) {
      setReplayStatus(tt('请求体不是有效 JSON', 'Request body is not valid JSON'), 'error');
    }
  }

  function buildCurlCommand(method, url, headers, bodyState) {
    method = String(method || 'GET').toUpperCase();
    headers = Object.assign({}, headers || {});
    var normalized = normalizeReplayBodyState(bodyState);
    normalizeReplayHeadersForBodyType(headers, normalized.type);
    var parts = ['curl'];
    parts.push('-X');
    parts.push(shellEscape(method));
    Object.keys(headers || {}).forEach(function(key) {
      parts.push('-H');
      parts.push(shellEscape(key + ': ' + headers[key]));
    });
    if (method !== 'GET' && method !== 'HEAD' && normalized.type === 'multipart') {
      normalizeReplayMultipartRows(normalized.fields).forEach(function(item) {
        if (!item.key) return;
        parts.push('-F');
        if (item.type === 'file') parts.push(shellEscape(item.key + '=@' + (replayMultipartFileName(item) || tt('选择文件', 'choose-file'))));
        else parts.push(shellEscape(item.key + '=' + String(item.value || '')));
      });
    } else if (method !== 'GET' && method !== 'HEAD') {
      var body = replayBodyStateToText(normalized);
      if (body) {
        parts.push('--data-raw');
        parts.push(shellEscape(body));
      }
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
      setReplayStatus(tt('没有可复制的 URL', 'No URL to copy'), 'error');
      showToast(tt('没有可复制的 URL', 'No URL to copy'), 'error');
      return;
    }
    var curl = buildCurlCommand(method, url, parseHeadersText(replayHeaders ? replayHeaders.value : ''), captureReplayBodyState({ includeFiles: true }));
    ApiStudioCompat.copyText(curl).then(function() {
      setReplayStatus(tt('cURL 已复制', 'cURL copied'), 'success');
      showToast(tt('cURL 已复制', 'cURL copied'));
    }).catch(function(error) {
      setReplayStatus(tt('复制失败: {message}', 'Copy failed: {message}', { message: error.message }), 'error');
      showToast(tt('复制失败: {message}', 'Copy failed: {message}', { message: error.message }), 'error');
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
        var bodyState = getReplayHistoryBodyState(item);
        item.bodyType = bodyState.type;
        item.body = replayBodyStateToText(bodyState);
        item.bodyFields = serializeReplayBodyState(bodyState).fields;
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
      replayGroupDropdown.innerHTML = '<div class="g-empty">' + escHtml(tt('没有匹配的分组', 'No matching groups')) + '</div>';
      return;
    }
    replayGroupDropdown.innerHTML = filtered.map(function(group) {
      return '<div class="g-item' + (group === activeReplayGroup ? ' active' : '') + '" data-group="' + escAttr(group) + '" title="' + escAttr(group) + '">' +
        '<span class="g-name">' + escHtml(group) + '</span>' +
        (group === DEFAULT_REPLAY_GROUP ? '' : '<span class="g-actions"><button class="g-act g-act-del" data-action="delete-replay-group" title="' + escAttr(tt('删除分组', 'Delete group')) + '" type="button">' + escHtml(t('common.delete')) + '</button></span>') +
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
    showToast(tt('已切换到分组：{name}', 'Switched to group: {name}', { name: next }));
  }

  function deleteReplayGroup(name) {
    var group = normalizeReplayGroup(name);
    if (group === DEFAULT_REPLAY_GROUP) {
      showToast(tt('默认分组不能删除', 'The default group cannot be deleted'), 'error');
      return;
    }
    var previousReplayGroups = replayGroups.slice();
    var previousActiveReplayGroup = activeReplayGroup;
    var movedHistoryIds = replayHistory.filter(function(item) {
      return normalizeReplayGroup(item.group) === group;
    }).map(function(item) { return item.id; });
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
    showUndoToast(t('undo.deletedReplayGroup', { name: group }), function() {
      replayGroups = uniqueReplayGroups([DEFAULT_REPLAY_GROUP].concat(previousReplayGroups));
      activeReplayGroup = previousActiveReplayGroup;
      replayHistory.forEach(function(item) {
        if (movedHistoryIds.indexOf(item.id) !== -1) item.group = group;
      });
      persistReplayGroups();
      persistReplayHistory();
      syncReplayGroupInput();
      renderReplayGroupDropdown();
      renderReplayHistory();
      loadFirstVisibleReplayHistory();
    });
  }

  async function moveReplayHistoryToGroup(id) {
    var item = replayHistory.find(function(entry) { return entry.id === id; });
    if (!item) return;
    var currentGroup = normalizeReplayGroup(item.group);
    var targets = replayGroups.filter(function(group) {
      return normalizeReplayGroup(group) !== currentGroup;
    });
    if (targets.length === 0) {
      showToast(tt('暂无其他已有分组可转移', 'No other existing groups to move to'), 'error');
      return;
    }

    var target = await appSelect(tt('转移分组', 'Move to group'), tt('选择要转移到的已有分组', 'Choose an existing group to move to'), targets);
    if (target === null) return;
    if (!target) {
      showToast(tt('没有找到这个已有分组', 'This existing group was not found'), 'error');
      return;
    }
    item.group = normalizeReplayGroup(target);
    delete selectedReplayHistoryIds[id];
    persistReplayHistory();
    renderReplayHistory();
    loadFirstVisibleReplayHistory();
    showToast(tt('已转移到分组：{name}', 'Moved to group: {name}', { name: item.group }));
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
    var bodyState = captureReplayBodyState({ includeFiles: true });
    var normalizedHeaders = parseHeadersText(headersText);
    normalizeReplayHeadersForBodyType(normalizedHeaders, bodyState.type);
    headersText = headersToEditorText(normalizedHeaders);
    if (replayHeaders) replayHeaders.value = headersText;
    var serializedBody = serializeReplayBodyState(bodyState);
    var body = serializedBody.raw;
    if (!url) {
      setReplayStatus(tt('没有可保存的 URL', 'No URL to save'), 'error');
      showToast(tt('没有可保存的 URL', 'No URL to save'), 'error');
      return;
    }
    var existing = replayHistory.find(function(item) {
      return (item.group || DEFAULT_REPLAY_GROUP) === (activeReplayGroup || DEFAULT_REPLAY_GROUP) &&
        isReplayHistorySameRequest(item, method, url, headersText, bodyState);
    });
    var sourceReq = getReplaySourceForCurrentForm(method, url, headersText, bodyState);
    var sourceStatus = normalizeReplayStatus(sourceReq && sourceReq.status);
    var sourceDuration = getReplayRequestDurationMs(sourceReq);
    var requestLine = method + ' ' + displayPath(url);
    var defaultName = existing && existing.name ? existing.name : requestLine;
    appPrompt(tt('保存请求', 'Save request'), tt('给这个请求起个名字，之后左侧列表会显示这个名字。', 'Name this request. The name will appear in the left list.'), defaultName).then(function(inputName) {
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
        bodyType: serializedBody.type,
        bodyFields: serializedBody.fields,
        status: sourceStatus || (existing ? normalizeReplayStatus(existing.status) : 0),
        statusText: sourceReq ? (sourceReq.statusText || '') : ((existing && existing.statusText) || ''),
        totalTimeMs: sourceDuration || (existing ? normalizeReplayDurationMs(existing.totalTimeMs || existing.lastReplayDurationMs || 0) : 0)
      });
      setText('replaySourceText', requestLine);
      setReplayStatus(existing ? tt('保存请求已更新', 'Saved request updated') : tt('请求已保存', 'Request saved'), 'success');
      showToast(existing ? tt('保存请求已更新', 'Saved request updated') : tt('请求已保存', 'Request saved'));
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
      replayHistoryList.innerHTML = '<div class="replay-history-empty">' + escHtml(replayHistorySearchText ? t('replay.noSavedMatched') : t('replay.noSavedInGroup')) + '</div>';
      syncReplayHistorySelection();
      return;
    }
    if (replayMethod && replayUrl) {
      var currentMethod = replayMethod.value || 'GET';
      var currentUrl = replayUrl.value.trim();
      var currentHeaders = replayHeaders ? replayHeaders.value : '';
      var currentBody = captureReplayBodyState({ includeFiles: true });
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
          '<label class="replay-history-select" title="' + escAttr(t('common.select')) + '"><input type="checkbox" data-history-id="' + escAttr(item.id) + '"' + (selectedKeys[item.id] ? ' checked' : '') + '></label>' +
          '<span class="replay-history-index">' + (index + 1) + '</span>' +
        '</div>' +
        '<div class="replay-history-main">' +
          '<div class="replay-history-path" title="' + escAttr(pathText || '-') + '">' + escHtml(pathText || '-') + '</div>' +
          '<div class="replay-history-meta-row">' +
            '<div class="replay-history-name" title="' + escAttr(nameText) + '">' + escHtml(displayNameText) + '</div>' +
            '<div class="replay-history-actions">' +
              '<button type="button" class="replay-history-action" data-action="rename" data-history-id="' + escAttr(item.id) + '" title="' + escAttr(tt('重命名', 'Rename')) + '">' + escHtml(tt('命名', 'Name')) + '</button>' +
              '<button type="button" class="replay-history-action" data-action="move" data-history-id="' + escAttr(item.id) + '" title="' + escAttr(tt('转移分组', 'Move group')) + '">' + escHtml(t('common.move')) + '</button>' +
              '<button type="button" class="replay-history-action danger" data-action="delete" data-history-id="' + escAttr(item.id) + '" title="' + escAttr(t('common.delete')) + '">' + escHtml(t('common.delete')) + '</button>' +
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
    applyReplayBodyState(getReplayHistoryBodyState(item));
    setText('replaySourceText', (item.method || 'GET') + ' ' + displayPath(item.url || ''));
    renderReplayResult(null);
    if (replayHistoryList) {
      replayHistoryList.querySelectorAll('.replay-history-item').forEach(function(node) {
        node.classList.toggle('active', node.dataset.historyId === id);
      });
    }
    setReplayStatus(tt('已载入保存请求', 'Saved request loaded'), 'success');
  }

  function renameReplayHistoryEntry(id) {
    var item = replayHistory.find(function(entry) { return entry.id === id; });
    if (!item) return;
    var requestLine = (item.method || 'GET') + ' ' + displayPath(item.url || '');
    appPrompt(tt('重命名保存请求', 'Rename saved request'), tt('给这个请求起个更好记的名字。', 'Give this request a more memorable name.'), item.name || item.label || requestLine).then(function(inputName) {
      if (inputName === null) return;
      var name = String(inputName || '').trim() || requestLine;
      item.name = name;
      item.label = name;
      item.fullLabel = name + ' · ' + (item.method || 'GET') + ' ' + (item.url || '');
      item.meta = item.meta || requestLine;
      persistReplayHistory();
      renderReplayHistory();
      setReplayStatus(tt('保存请求已重命名', 'Saved request renamed'), 'success');
      showToast(tt('保存请求已重命名', 'Saved request renamed'));
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
    if (replayBatchDeleteBtn) replayBatchDeleteBtn.textContent = selectedCount > 0 ? t('replay.deleteCount', { count: selectedCount }) : t('replay.deleteSelected');
    if (replayHistoryToggleAll) {
      replayHistoryToggleAll.checked = visibleHistory.length > 0 && selectedCount === visibleHistory.length;
      replayHistoryToggleAll.indeterminate = selectedCount > 0 && selectedCount < visibleHistory.length;
    }
  }

  function deleteReplayHistoryEntry(id) {
    var index = replayHistory.findIndex(function(item) { return item.id === id; });
    var deletedItem = index >= 0 ? cloneData(replayHistory[index]) : null;
    var group = deletedItem ? normalizeReplayGroup(deletedItem.group) : activeReplayGroup;
    replayHistory = replayHistory.filter(function(item) { return item.id !== id; });
    delete selectedReplayHistoryIds[id];
    persistReplayHistory();
    renderReplayHistory();
    setReplayStatus(tt('保存请求已删除', 'Saved request deleted'), 'success');
    if (deletedItem) {
      showUndoToast(t('undo.deletedReplay', { name: replayHistoryNameText(deletedItem) }), function() {
        restoreReplayHistoryEntries([{ item: deletedItem, index: index }], { group: group, focusId: deletedItem.id });
        setReplayStatus(tt('已恢复保存请求', 'Saved request restored'), 'success');
      });
    }
  }

  function resendSelectedRequest() {
    var req = replayRequestId ? findReq(replayRequestId) : null;

    var method = replayMethod && replayMethod.value ? replayMethod.value.toUpperCase() : 'GET';
    var url = replayUrl ? replayUrl.value.trim() : '';
    var headersText = replayHeaders ? replayHeaders.value : '';
    var headers = parseHeadersText(headersText);
    var bodyState = captureReplayBodyState({ includeFiles: true });

    if (!url) {
      setReplayStatus(tt('请输入请求 URL', 'Please enter a request URL'), 'error');
      if (replayUrl) replayUrl.focus();
      return;
    }

    var bodyPayload;
    try {
      bodyPayload = buildReplayFetchBody(method, headers, bodyState);
      headersText = headersToEditorText(headers);
      if (replayHeaders) replayHeaders.value = headersText;
    } catch (error) {
      setReplayStatus(tt('发送失败: {message}', 'Send failed: {message}', { message: error.message }), 'error');
      showToast(tt('发送失败: {message}', 'Send failed: {message}', { message: error.message }), 'error');
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
    if (method !== 'GET' && method !== 'HEAD' && bodyPayload.body) fetchOptions.body = bodyPayload.body;

    sendReplayBtn.disabled = true;
    setReplayStatus(tt('请求发送中...', 'Sending request...'), '');
    var startedAt = Date.now();

    fetch(url, fetchOptions).then(function(response) {
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
      req.postData = method === 'GET' || method === 'HEAD' ? '' : bodyPayload.preview;
      req.replayBodyState = serializeReplayBodyState(bodyPayload.state);
      req.postDataMimeType = bodyPayload.state.type === 'urlencoded' ? 'application/x-www-form-urlencoded;charset=UTF-8' : (bodyPayload.state.type === 'multipart' ? 'multipart/form-data' : '');
      req.postDataParams = postDataParamsFromReplayBodyState(bodyPayload.state);
      req.status = result.status;
      req.statusText = result.statusText;
      req.resHeaders = result.headers;
      req.responseContent = result.body;
      req.responseEncoding = '';
      req.responseBodyState = req.responseContent ? 'text' : 'empty';
      req.responseBodyMessage = req.responseContent ? '' : tt('该请求没有可返回的响应体。', 'This request has no response body.');
      req.mimeType = result.headers['content-type'] || req.mimeType || '';
      req.resourceType = requestTypeFromValues(url, req.mimeType);
      req.lastReplayDurationMs = durationMs;
      req.totalTimeMs = durationMs;
      req.timeSource = 'replay';
      replayRequestId = req.id;
      req.imported = hasImportedRuleForRequest(req);
      if (!req.imported) req.ruleId = '';
      syncReplayHistoryResult(method, url, headersText, bodyPayload.state, result.status, result.statusText, durationMs);
      updateStoredRequestSnapshot(req);
      renderNetworkList();
      renderBeaconTab();
      if (selectedId === req.id) showDetails(req.id);
      renderReplayResult(req);
      setText('replaySourceText', method + ' ' + displayPath(url));
      renderReplayHistory();
      updateBadge();
      setReplayStatus(tt('请求已完成，状态码 {status}，耗时 {time} ms', 'Request completed, status {status}, time {time} ms', { status: result.status, time: durationMs }), result.ok ? 'success' : 'error');
      showToast(result.ok ? tt('请求已重发', 'Request resent') : tt('请求返回错误状态码 {status}', 'Request returned error status {status}', { status: result.status }), result.ok ? undefined : 'error');
    }).catch(function(error) {
      setReplayStatus(tt('发送失败: {message}', 'Send failed: {message}', { message: error.message }), 'error');
      showToast(tt('发送失败: {message}', 'Send failed: {message}', { message: error.message }), 'error');
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
      upsertById(rules, rule);
      groups = uniqueGroups(groups.concat([normalizeGroup(rule.group)]));
      req.imported = true;
      req.ruleId = rule.id;
      updateStoredRequestImport(req);
      renderRules();
      renderNetworkList();
      renderBeaconTab();
      showDetails(req.id);
      showToast(tt('✦ 已导入: {name}', '✦ Imported: {name}', { name: name }));
    });
  }

  function unimportRequest(req) {
    if (!req) return;
    if (!req.ruleId) {
      var matchedRule = findImportedRuleForRequest(req);
      if (matchedRule) {
        req.imported = true;
        req.ruleId = matchedRule.id;
      }
    }
    if (!req.imported || !req.ruleId) {
      req.imported = false;
      updateStoredRequestImport(req);
      refreshDetailImportState();
      renderNetworkList();
      return;
    }
    var ruleId = req.ruleId;
    chrome.runtime.sendMessage({ type: 'DELETE_RULE', ruleId: ruleId }, function() {
      rules = rules.filter(function(rule) { return rule.id !== ruleId; });
      selectedRuleIds = Object.assign({}, selectedRuleIds);
      delete selectedRuleIds[ruleId];
      req.imported = false;
      req.ruleId = '';
      updateStoredRequestImport(req);
      renderRules();
      renderNetworkList();
      renderBeaconTab();
      if (selectedId === req.id) showDetails(req.id);
      loadRules();
      showToast(tt('已取消导入 Mock', 'Mock import removed'));
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
          item.postData = req.postData || '';
          item.postDataMimeType = req.postDataMimeType || '';
          item.postDataParams = req.postDataParams || [];
          item.replayBodyState = req.replayBodyState || null;
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
    return name && name !== requestLine ? name : t('common.unnamed');
  }

  function truncateReplayHistoryName(name) {
    var value = String(name || '');
    return value.length > 15 ? value.slice(0, 15) + '...' : value;
  }

  function normalizeReplayText(value) {
    return String(value || '').replace(/\r\n/g, '\n');
  }

  function isReplayHistorySameRequest(item, method, url, headersText, bodyState) {
    return !!item &&
      (item.method || 'GET').toUpperCase() === String(method || 'GET').toUpperCase() &&
      item.url === url &&
      replayHeadersSignature(item.headersText) === replayHeadersSignature(headersText) &&
      replayBodySignature(getReplayHistoryBodyState(item)) === replayBodySignature(bodyState);
  }

  function getReplaySourceForCurrentForm(method, url, headersText, bodyState) {
    var req = replayRequestId ? findReq(replayRequestId) : null;
    if (!req) return null;
    if ((req.method || 'GET').toUpperCase() !== String(method || 'GET').toUpperCase() || req.url !== url) return null;
    if (replayHeadersSignature(buildReplayHeadersText(req)) !== replayHeadersSignature(headersText)) return null;
    var reqBodyState = req.replayBodyState || replayBodyStateFromRequest(req, buildReplayHeadersText(req));
    if (replayBodySignature(reqBodyState) !== replayBodySignature(bodyState)) return null;
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

  function syncReplayHistoryResult(method, url, headersText, bodyState, status, statusText, durationMs) {
    var changed = false;
    replayHistory.forEach(function(item) {
      if (!isReplayHistorySameRequest(item, method, url, headersText, bodyState)) return;
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
    if (source === 'har') return tt('HAR: 浏览器 DevTools/HAR 提供的原生总耗时', 'HAR: native total time from browser DevTools/HAR');
    if (source === 'timings') return tt('timings: 使用请求各阶段耗时相加得到的近似总耗时', 'timings: approximate total time from summed request phases');
    if (source === 'replay') return tt('Replay: 使用本插件重新发送请求时记录的耗时', 'Replay: duration recorded when this extension resent the request');
    return tt('耗时来源未知', 'Unknown timing source');
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
    if (cookiesCountBadge) cookiesCountBadge.textContent = t('cookies.count', { count: cookieEntries.length });
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
    return [{ field: saved.field || '', contains: saved.contains || '', mode: 'fuzzy' }];
  }

  function normalizeBeaconConditions(conditions) {
    return (conditions || []).map(function(item) {
      return {
        field: String((item && item.field) || '').trim(),
        contains: String((item && item.contains) || '').trim(),
        mode: (item && item.mode) === 'exact' ? 'exact' : 'fuzzy'
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
    var rows = (beaconConfig.conditions && beaconConfig.conditions.length ? beaconConfig.conditions : [{ field: '', contains: '', mode: 'fuzzy' }]);
    beaconConditions.innerHTML = rows.map(function(item, index) {
      var mode = item.mode === 'exact' ? 'exact' : 'fuzzy';
      return '<div class="beacon-condition-row" data-index="' + index + '">' +
        '<input class="form-input beacon-input beacon-condition-key" type="text" placeholder="' + escAttr(t('beacon.keyPlaceholder')) + '" value="' + escAttr(item.field || '') + '">' +
        '<input class="form-input beacon-input beacon-condition-value" type="text" placeholder="' + escAttr(t('beacon.valuePlaceholder')) + '" value="' + escAttr(item.contains || '') + '">' +
        '<select class="form-select form-select-sm beacon-condition-mode" title="' + escAttr(t('beacon.matchMode')) + '">' +
          '<option value="fuzzy"' + (mode === 'fuzzy' ? ' selected' : '') + '>' + escHtml(t('beacon.fuzzy')) + '</option>' +
          '<option value="exact"' + (mode === 'exact' ? ' selected' : '') + '>' + escHtml(t('beacon.exact')) + '</option>' +
        '</select>' +
        '<button class="btn btn-sm beacon-condition-remove" data-action="delete-beacon-condition" type="button" title="' + escAttr(t('beacon.deleteCondition')) + '">' + escHtml(t('common.delete')) + '</button>' +
      '</div>';
    }).join('');
    updateBeaconConditionRemoveState();
    updateBeaconConditionVisibility();
  }

  function updateBeaconConditionVisibility() {
    if (beaconConditions) beaconConditions.classList.toggle('collapsed', !beaconConditionsExpanded);
    if (addBeaconConditionBtn) addBeaconConditionBtn.style.display = beaconConditionsExpanded ? 'inline-flex' : 'none';
    if (toggleBeaconConditionsBtn) toggleBeaconConditionsBtn.textContent = beaconConditionsExpanded ? t('beacon.collapseConditions') : t('beacon.editConditions');
    if (beaconConditionSummary) beaconConditionSummary.style.display = beaconConditionsExpanded ? 'none' : 'flex';
    renderBeaconConditionSummary();
  }

  function renderBeaconConditionSummary() {
    if (!beaconConditionSummary) return;
    var conditions = getBeaconConditions();
    if (!conditions.length) {
      beaconConditionSummary.classList.add('empty');
      beaconConditionSummary.textContent = t('beacon.noConditions');
      return;
    }
    beaconConditionSummary.classList.remove('empty');
    beaconConditionSummary.innerHTML = conditions.map(function(item) {
      var op = item.mode === 'exact' ? '=' : '≈';
      var text = (item.field || t('beacon.fullText')) + (item.contains ? op + item.contains : '');
      return '<span class="beacon-condition-chip" title="' + escAttr(text) + '">' + escHtml(text) + '</span>';
    }).join('');
  }

  function syncBeaconConditionsFromDom() {
    if (!beaconConditions) return;
    beaconConfig.conditions = Array.prototype.slice.call(beaconConditions.querySelectorAll('.beacon-condition-row')).map(function(row) {
      return {
        field: ((row.querySelector('.beacon-condition-key') || {}).value || '').trim(),
        contains: ((row.querySelector('.beacon-condition-value') || {}).value || '').trim(),
        mode: ((row.querySelector('.beacon-condition-mode') || {}).value || 'fuzzy') === 'exact' ? 'exact' : 'fuzzy'
      };
    });
  }

  function ensureBeaconConditionRows() {
    if (!beaconConditions || beaconConditions.querySelector('.beacon-condition-row')) {
      updateBeaconConditionRemoveState();
      return;
    }
    beaconConfig.conditions = [{ field: '', contains: '', mode: 'fuzzy' }];
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
    beaconCountBadge.title = t('beacon.hitTitle', { count: matches.length });
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
        ? '<span class="beacon-match-badge">' + escHtml(t('beacon.fieldValueCount', { count: item.fieldValues.length })) + '</span>'
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
          '<button class="beacon-match-delete" data-action="delete-beacon-match" type="button" title="' + escAttr(t('beacon.deleteHit')) + '">' + escHtml(t('common.delete')) + '</button>' +
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
      ? t('beacon.conditionsHit', { hit: match.matchedConditions.length, total: conditions.length })
      : t('beacon.noWatchField');
    setText('beaconDetailField', fieldText);
    var fieldEl = $('beaconDetailField');
    if (fieldEl) fieldEl.className = 'value ' + (conditions.length && match.matchedConditions.length === conditions.length ? 'beacon-field-hit' : 'beacon-field-miss');
    setText('beaconDetailFieldValues', match.fieldValues.length ? match.fieldValues.map(function(item) { return item.path + ': ' + item.value; }).join('\n') : t('common.empty'));
    setBeaconPayloadHtml(match);
  }

  function setBeaconPayloadHtml(match) {
    var el = $('beaconDetailPayload');
    if (!el) return;
    if (!match || !match.payloadText) {
      el.textContent = t('common.empty');
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
    var requestIndex = requests.findIndex(function(req) { return req.id === id; });
    var deletedReq = requestIndex >= 0 ? cloneData(requests[requestIndex]) : null;
    requests = requests.filter(function(req) { return req.id !== id; });
    delete highlightedRequestIds[id];
    syncLatestRequestFromList();
    if (selectedBeaconId === id) selectedBeaconId = '';
    if (selectedId === id) {
      selectedId = null;
      if (detailEmpty) detailEmpty.style.display = 'flex';
      if (detailContent) detailContent.style.display = 'none';
    }
    chrome.storage.local.get('capturedRequests', function(result) {
      var capturedList = result.capturedRequests || [];
      var capturedIndex = capturedList.findIndex(function(req) { return req.id === id; });
      var capturedReq = capturedIndex >= 0 ? cloneData(capturedList[capturedIndex]) : null;
      var list = capturedList.filter(function(req) { return req.id !== id; });
      chrome.storage.local.set({ capturedRequests: list }, function() {
        if (deletedReq || capturedReq) {
          showUndoToast(t('undo.deletedBeacon'), function() {
            var restoreReq = cloneData(deletedReq || capturedReq);
            if (restoreReq && !requests.some(function(req) { return req.id === restoreReq.id; })) {
              requests = insertAt(requests, restoreReq, requestIndex >= 0 ? requestIndex : 0);
            }
            chrome.storage.local.get('capturedRequests', function(nextResult) {
              var nextList = (nextResult.capturedRequests || []).filter(function(req) { return req.id !== id; });
              if (capturedReq || restoreReq) nextList = insertAt(nextList, cloneData(capturedReq || restoreReq), capturedIndex >= 0 ? capturedIndex : 0);
              chrome.storage.local.set({ capturedRequests: nextList });
            });
            selectedBeaconId = id;
            renderNetworkList();
            renderBeaconTab();
            updateBadge();
          });
        }
      });
    });
    renderNetworkList();
    renderBeaconTab();
    updateBadge();
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
        appendBeaconParam(query, key, normalizeBeaconDecodedValue(value, 0, key));
      });
    } catch (e) {}
    var bodyRaw = req.postData || '';
    var bodyParsed = parseBeaconBody(bodyRaw, req.headers || {}, req.postDataParams || []);
    return {
      query: query,
      body: bodyParsed,
      merged: {
        query: query,
        body: bodyParsed
      }
    };
  }

  function parseBeaconBody(bodyRaw, headers, postDataParams) {
    if (!bodyRaw && Array.isArray(postDataParams) && postDataParams.length) {
      var bodyFromParams = {};
      normalizePostDataParams(postDataParams).forEach(function(item) {
        appendBeaconParam(bodyFromParams, item.key, normalizeBeaconDecodedValue(item.value, 0, item.key));
      });
      return bodyFromParams;
    }
    if (!bodyRaw) return {};
    var contentType = String((headers || {})['content-type'] || '').toLowerCase();
    if (contentType.indexOf('json') !== -1) {
      try { return normalizeBeaconDecodedValue(JSON.parse(bodyRaw), 0, 'body'); } catch (e) {}
    }
    if (contentType.indexOf('x-www-form-urlencoded') !== -1 || looksLikeBeaconParamString(bodyRaw, '&', { allowSingle: true })) {
      return parseBeaconParamString(bodyRaw, '&');
    }
    try { return normalizeBeaconDecodedValue(JSON.parse(bodyRaw), 0, 'body'); } catch (e2) {}
    return { raw: normalizeBeaconDecodedValue(bodyRaw, 0, 'raw') };
  }

  function appendBeaconParam(target, key, value) {
    key = decodeBeaconText(key);
    if (!key) return;
    if (target[key] === undefined) target[key] = value;
    else if (Array.isArray(target[key])) target[key].push(value);
    else target[key] = [target[key], value];
  }

  function parseBeaconParamString(raw, separator) {
    separator = separator || '&';
    var form = {};
    splitBeaconParamPairs(raw, separator).forEach(function(pair) {
      if (!pair) return;
      var idx = pair.indexOf('=');
      var key = idx >= 0 ? pair.slice(0, idx) : pair;
      var value = idx >= 0 ? pair.slice(idx + 1) : '';
      appendBeaconParam(form, key, normalizeBeaconDecodedValue(value, 0, key));
    });
    return form;
  }

  function splitBeaconParamPairs(raw, separator) {
    var text = String(raw || '');
    if (separator !== '$') return text.split(separator);
    var pairs = [];
    var start = 0;
    var depth = 0;
    var quote = '';
    var escaped = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (quote) {
        if (escaped) {
          escaped = false;
        } else if (ch === '\\') {
          escaped = true;
        } else if (ch === quote) {
          quote = '';
        }
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        continue;
      }
      if (ch === '{' || ch === '[') {
        depth++;
        continue;
      }
      if (ch === '}' || ch === ']') {
        depth = Math.max(0, depth - 1);
        continue;
      }
      if (ch !== separator || depth > 0) continue;
      if (!isBeaconParamBoundary(text, i, separator)) continue;
      pairs.push(text.slice(start, i));
      start = i + 1;
    }
    pairs.push(text.slice(start));
    return pairs;
  }

  function isBeaconParamBoundary(text, index, separator) {
    if (text.charAt(index) !== separator) return false;
    var rest = text.slice(index + 1);
    var eqIndex = rest.indexOf('=');
    if (eqIndex <= 0 || eqIndex > 80) return false;
    var key = rest.slice(0, eqIndex);
    return /^[A-Za-z0-9_.:-]+$/.test(key);
  }

  function normalizeBeaconDecodedValue(value, depth, key) {
    depth = depth || 0;
    if (depth > 5) return value;
    if (Array.isArray(value)) {
      return value.map(function(item) { return normalizeBeaconDecodedValue(item, depth + 1, key); });
    }
    if (value && typeof value === 'object') {
      var obj = {};
      Object.keys(value).forEach(function(itemKey) {
        obj[itemKey] = normalizeBeaconDecodedValue(value[itemKey], depth + 1, itemKey);
      });
      return obj;
    }
    if (typeof value !== 'string') return value;

    var decoded = decodeBeaconText(value);
    var trimmed = decoded.trim();
    if (!trimmed) return decoded;

    var jsonParsed = tryParseBeaconJson(trimmed);
    if (jsonParsed.ok) return normalizeBeaconDecodedValue(jsonParsed.value, depth + 1, key);

    // 生产埋点里常见的“加密串”多数是多层 URL 编码：先还原文本，再按埋点分隔符拆字段并递归解码字段值。
    if (!isLikelyUrl(trimmed) && looksLikeBeaconParamString(trimmed, '$')) {
      return parseBeaconParamString(trimmed, '$');
    }
    if (!isLikelyUrl(trimmed) && looksLikeBeaconParamString(trimmed, '&')) {
      return parseBeaconParamString(trimmed, '&');
    }
    if (!isLikelyUrl(trimmed) && key && String(key).toLowerCase() === 'ext' && looksLikeBeaconParamString(trimmed, '&', { allowSingle: true })) {
      return parseBeaconParamString(trimmed, '&');
    }
    return decoded;
  }

  function decodeBeaconText(value) {
    var text = String(value === undefined || value === null ? '' : value).replace(/\+/g, ' ');
    for (var i = 0; i < 5; i++) {
      var next = safeDecodeBeaconURIComponent(text);
      if (next === text) break;
      text = next;
    }
    return text;
  }

  function safeDecodeBeaconURIComponent(value) {
    try {
      return decodeURIComponent(value);
    } catch (e) {
      return value;
    }
  }

  function tryParseBeaconJson(text) {
    if (!text || !/^[\[{]/.test(text)) return { ok: false, value: null };
    try {
      return { ok: true, value: JSON.parse(text) };
    } catch (e) {
      return { ok: false, value: null };
    }
  }

  function looksLikeBeaconParamString(text, separator, options) {
    options = options || {};
    text = String(text || '');
    if (text.indexOf('=') <= 0) return false;
    if (separator && text.indexOf(separator) === -1 && separator !== '&') return false;
    if (separator === '&' && text.indexOf('&') === -1) return !!options.allowSingle;
    return true;
  }

  function isLikelyUrl(text) {
    return /^https?:\/\//i.test(String(text || ''));
  }

  function matchBeaconConditions(source, conditions) {
    var result = { matched: true, fieldValues: [], matchedConditions: [] };
    if (!conditions.length) return result;
    conditions.forEach(function(condition) {
      var values = collectBeaconFieldValues(source, condition.field);
      if (condition.contains) {
        values = values.filter(function(item) {
          return beaconValueMatches(item.rawValue, condition.contains, condition.mode);
        });
      }
      if (values.length === 0) {
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
        containsText: String(condition.contains || '').trim(),
        mode: condition.mode === 'exact' ? 'exact' : 'fuzzy'
      };
    }).filter(function(rule) { return !!rule.fieldLower || !!rule.containsText; });
    var lines = [];
    renderBeaconJsonValue(payload, '', 0, lines, highlightRules);
    return lines.join('\n') || t('common.empty');
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
        var item = value[key];
        var hitRule = getBeaconHighlightRule(key, item, nextPath, highlightRules);
        var keyHtml = escHtml(JSON.stringify(key));
        if (hitRule) keyHtml = '<span class="beacon-json-hit-key">' + keyHtml + '</span>';
        if (item && typeof item === 'object') {
          lines.push(repeatSpaces((depth + 1) * 2) + keyHtml + ': ' + (Array.isArray(item) ? '[' : '{'));
          renderBeaconJsonChildren(item, nextPath, depth + 2, lines, highlightRules);
          lines.push(repeatSpaces((depth + 1) * 2) + (Array.isArray(item) ? ']' : '}') + (index < keys.length - 1 ? ',' : ''));
        } else {
          lines.push(repeatSpaces((depth + 1) * 2) + keyHtml + ': ' + formatBeaconJsonPrimitive(item, key, nextPath, highlightRules) + (index < keys.length - 1 ? ',' : ''));
        }
      });
      lines.push(indent + '}');
      return;
    }
    lines.push(indent + formatBeaconJsonPrimitive(value, '', path, highlightRules));
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
      var item = value[key];
      var hitRule = getBeaconHighlightRule(key, item, nextPath, highlightRules);
      var keyHtml = escHtml(JSON.stringify(key));
      if (hitRule) keyHtml = '<span class="beacon-json-hit-key">' + keyHtml + '</span>';
      if (item && typeof item === 'object') {
        lines.push(repeatSpaces(depth * 2) + keyHtml + ': ' + (Array.isArray(item) ? '[' : '{'));
        renderBeaconJsonChildren(item, nextPath, depth + 1, lines, highlightRules);
        lines.push(repeatSpaces(depth * 2) + (Array.isArray(item) ? ']' : '}') + (index < entries.length - 1 ? ',' : ''));
      } else {
        lines.push(repeatSpaces(depth * 2) + keyHtml + ': ' + formatBeaconJsonPrimitive(item, key, nextPath, highlightRules) + (index < entries.length - 1 ? ',' : ''));
      }
    });
  }

  function appendCommaToLastLine(lines, beforeIndex, shouldAppend) {
    if (!shouldAppend || lines.length <= beforeIndex) return;
    lines[lines.length - 1] += ',';
  }

  function formatBeaconJsonPrimitive(value, key, path, highlightRules) {
    var text = JSON.stringify(value);
    if (text === undefined) text = String(value);
    var shouldHighlight = !!getBeaconHighlightRule(key, value, path, highlightRules);
    var html = escHtml(text);
    return shouldHighlight ? '<span class="beacon-json-hit-value">' + html + '</span>' : html;
  }

  function getBeaconHighlightRule(key, value, path, highlightRules) {
    var keyLower = String(key || '').toLowerCase();
    return (highlightRules || []).find(function(rule) {
      var containsText = rule.containsText || '';
      if (!rule.fieldLower) {
        return containsText && (beaconValueMatches(key, containsText, rule.mode) || beaconValueMatches(value, containsText, rule.mode));
      }
      if (keyLower === rule.fieldLower) {
        return !containsText || beaconValueMatches(value, containsText, rule.mode);
      }
      if (!isBeaconPathInsideField(path, rule.fieldLower)) return false;
      return containsText && (beaconValueMatches(key, containsText, rule.mode) || beaconValueMatches(value, containsText, rule.mode));
    }) || null;
  }

  function isBeaconPathInsideField(path, fieldLower) {
    if (!path || !fieldLower) return false;
    return String(path).toLowerCase().split('.').some(function(part) {
      return part.replace(/\[\d+\]/g, '') === fieldLower;
    });
  }

  function repeatSpaces(count) {
    return new Array(count + 1).join(' ');
  }

  function collectBeaconFieldValues(source, fieldName) {
    var hits = [];
    if (!fieldName) {
      return [{ path: 'payload', value: formatBeaconFieldValue(source), rawValue: source }];
    }
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
          value: formatBeaconFieldValue(value[key]),
          rawValue: value[key]
        });
      }
      walkBeaconObject(value[key], nextPath, fieldLower, hits);
    });
  }

  function formatBeaconFieldValue(value) {
    if (value && typeof value === 'object') {
      try { return JSON.stringify(value); } catch (e) { return String(value); }
    }
    return String(value);
  }

  function beaconValueMatches(value, expectedText, mode) {
    expectedText = String(expectedText || '').trim();
    if (!expectedText) return true;

    var matchValue = parseBeaconActualJson(value);
    var parsedExpected = parseBeaconExpectedJson(expectedText);
    if (mode === 'exact') return beaconValueExactMatches(matchValue, parsedExpected, expectedText);
    if (parsedExpected.ok && partialBeaconJsonMatch(matchValue, parsedExpected.value)) return true;

    var searchText = buildBeaconSearchText(matchValue);
    if (matchValue !== value) searchText += '\n' + buildBeaconSearchText(value);
    searchText = searchText.toLowerCase();
    var expectedLower = expectedText.toLowerCase();
    if (searchText.indexOf(expectedLower) !== -1) return true;

    var compactSearch = normalizeBeaconSearchText(searchText);
    var compactExpected = normalizeBeaconSearchText(expectedLower);
    if (compactExpected && compactSearch.indexOf(compactExpected) !== -1) return true;

    var tokens = expectedLower.split(/[\s,;:=]+/).map(function(item) {
      return item.trim();
    }).filter(Boolean);
    return tokens.length > 1 && tokens.every(function(token) {
      return searchText.indexOf(token) !== -1 || compactSearch.indexOf(normalizeBeaconSearchText(token)) !== -1;
    });
  }

  function beaconValueExactMatches(value, parsedExpected, expectedText) {
    if (parsedExpected.ok) return partialBeaconJsonMatch(value, parsedExpected.value, true);
    if (value && typeof value === 'object') return beaconExactTextInObject(value, expectedText);
    return normalizeBeaconExactText(value) === normalizeBeaconExactText(expectedText);
  }

  function beaconExactTextInObject(value, expectedText) {
    var expected = normalizeBeaconExactText(expectedText);
    if (!expected) return true;
    var matched = false;
    walkBeaconExactValue(value, function(key, item) {
      if (matched) return;
      if (normalizeBeaconExactText(key) === expected) {
        matched = true;
        return;
      }
      if (!item || typeof item !== 'object') matched = normalizeBeaconExactText(item) === expected;
    });
    return matched;
  }

  function walkBeaconExactValue(value, visitor) {
    if (Array.isArray(value)) {
      value.forEach(function(item, index) {
        visitor(String(index), item);
        walkBeaconExactValue(item, visitor);
      });
      return;
    }
    if (!value || typeof value !== 'object') return;
    Object.keys(value).forEach(function(key) {
      visitor(key, value[key]);
      walkBeaconExactValue(value[key], visitor);
    });
  }

  function parseBeaconExpectedJson(text) {
    try {
      return { ok: true, value: JSON.parse(text) };
    } catch (e) {
      return { ok: false, value: null };
    }
  }

  function parseBeaconActualJson(value) {
    if (typeof value !== 'string') return value;
    var text = value.trim();
    if (!text) return value;
    var parsed = parseBeaconExpectedJson(text);
    return parsed.ok ? parsed.value : value;
  }

  function partialBeaconJsonMatch(actual, expected, exactPrimitive) {
    if (Array.isArray(expected)) {
      if (Array.isArray(actual)) {
        return expected.every(function(expectedItem) {
          return actual.some(function(actualItem) { return partialBeaconJsonMatch(actualItem, expectedItem, exactPrimitive); });
        });
      }
      if (actual && typeof actual === 'object') return Object.keys(actual).some(function(key) { return partialBeaconJsonMatch(actual[key], expected, exactPrimitive); });
      return false;
    }

    if (expected && typeof expected === 'object') {
      if (Array.isArray(actual)) return actual.some(function(item) { return partialBeaconJsonMatch(item, expected, exactPrimitive); });
      if (!actual || typeof actual !== 'object') return false;
      if (isBeaconObjectSubset(actual, expected, exactPrimitive)) return true;
      return Object.keys(actual).some(function(key) { return partialBeaconJsonMatch(actual[key], expected, exactPrimitive); });
    }

    return exactPrimitive ? normalizeBeaconExactText(actual) === normalizeBeaconExactText(expected) : beaconPrimitiveMatches(actual, expected);
  }

  function isBeaconObjectSubset(actual, expected, exactPrimitive) {
    return Object.keys(expected).every(function(expectedKey) {
      var actualKey = findBeaconObjectKey(actual, expectedKey);
      return actualKey !== null && partialBeaconJsonMatch(actual[actualKey], expected[expectedKey], exactPrimitive);
    });
  }

  function findBeaconObjectKey(obj, key) {
    if (!obj || typeof obj !== 'object') return null;
    if (Object.prototype.hasOwnProperty.call(obj, key)) return key;
    var lower = String(key).toLowerCase();
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      if (String(keys[i]).toLowerCase() === lower) return keys[i];
    }
    return null;
  }

  function beaconPrimitiveMatches(actual, expected) {
    var actualText = buildBeaconSearchText(actual).toLowerCase();
    var expectedText = String(expected == null ? '' : expected).toLowerCase();
    if (!expectedText) return true;
    return actualText.indexOf(expectedText) !== -1 || normalizeBeaconSearchText(actualText).indexOf(normalizeBeaconSearchText(expectedText)) !== -1;
  }

  function buildBeaconSearchText(value) {
    var lines = [];
    try { lines.push(JSON.stringify(value)); } catch (e) { lines.push(String(value)); }
    appendBeaconSearchLines(value, '', lines);
    return lines.filter(Boolean).join('\n');
  }

  function appendBeaconSearchLines(value, path, lines) {
    if (Array.isArray(value)) {
      value.forEach(function(item, index) {
        appendBeaconSearchLines(item, path + '[' + index + ']', lines);
      });
      return;
    }
    if (value && typeof value === 'object') {
      Object.keys(value).forEach(function(key) {
        var nextPath = path ? path + '.' + key : key;
        lines.push(nextPath);
        appendBeaconSearchLines(value[key], nextPath, lines);
      });
      return;
    }
    if (path) lines.push(path + '=' + String(value));
    lines.push(String(value));
  }

  function normalizeBeaconSearchText(text) {
    return String(text || '').toLowerCase().replace(/[\s"'`{}\[\](),;:=]+/g, '').replace(/\\/g, '');
  }

  function normalizeBeaconExactText(value) {
    return String(value == null ? '' : value).trim().toLowerCase();
  }

  function stringifyBeaconPayload(payload) {
    try { return JSON.stringify(payload, null, 2); } catch (e) { return String(payload || ''); }
  }

  function buildBeaconSummary(parsed, fieldValues, conditions) {
    var parts = [];
    var queryKeys = Object.keys(parsed.query || {});
    var bodyKeys = parsed.body && typeof parsed.body === 'object' ? Object.keys(parsed.body) : [];
    if (queryKeys.length) parts.push(t('beacon.summaryQuery', { count: queryKeys.length }));
    if (bodyKeys.length) parts.push(t('beacon.summaryBody', { count: bodyKeys.length }));
    if ((conditions || []).length) {
      parts.push(fieldValues.length ? t('beacon.summaryConditionHit', { count: fieldValues.length }) : t('beacon.summaryConditionMiss'));
    }
    return parts.join(' · ') || t('beacon.summaryEmpty');
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

  function upsertById(list, item) {
    var idx = list.findIndex(function(entry) { return entry.id === item.id; });
    if (idx >= 0) list[idx] = item;
    else list.unshift(item);
  }

  // ======================================================================
  // QR CODE TAB
  // ======================================================================

  function loadQrText() {
    if (!qrInput) return;
    try { qrInput.value = localStorage.getItem('apiStudioQrText') || ''; } catch (e) {}
  }

  function persistQrText(text) {
    try { localStorage.setItem('apiStudioQrText', text || ''); } catch (e) {}
  }

  function renderQrTab() {
    if (!qrInput || !qrCanvas) return;
    var text = qrInput.value || '';
    var maxBytes = (window.ApiStudioQr && window.ApiStudioQr.maxBytes) || 271;
    var bytes = getQrByteLength(text);
    if (qrMeta) qrMeta.textContent = bytes + ' / ' + maxBytes + ' bytes';

    if (!text) {
      qrLastResult = null;
      drawQrPlaceholder();
      setQrStatus(t('qr.emptyHint'));
      updateQrActions(false);
      return;
    }

    if (!window.ApiStudioQr || typeof window.ApiStudioQr.create !== 'function') {
      qrLastResult = null;
      drawQrPlaceholder();
      setQrStatus(t('qr.generatorMissing'), 'error');
      updateQrActions(false);
      return;
    }

    try {
      qrLastResult = window.ApiStudioQr.create(text);
      drawQrModules(qrCanvas, qrLastResult.modules);
      setQrStatus(t('qr.generated', { version: qrLastResult.version, bytes: qrLastResult.bytes }), 'success');
      updateQrActions(true);
    } catch (error) {
      qrLastResult = null;
      drawQrPlaceholder();
      var message = error && error.message === 'TOO_LONG'
        ? t('qr.tooLong', { max: maxBytes })
        : (error && error.message === 'EMPTY_INPUT' ? t('qr.emptyInput') : String(error && error.message || error));
      setQrStatus(message, 'error');
      updateQrActions(false);
    }
  }

  function updateQrActions(enabled) {
    if (qrDownloadBtn) qrDownloadBtn.disabled = !enabled;
    if (qrCopyBtn) qrCopyBtn.disabled = !enabled;
  }

  function setQrStatus(message, type) {
    if (!qrStatus) return;
    qrStatus.textContent = message || '';
    qrStatus.className = 'qr-status' + (type ? ' ' + type : '');
  }

  function getQrByteLength(text) {
    if (!text) return 0;
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text).length;
    return unescape(encodeURIComponent(text)).length;
  }

  function drawQrPlaceholder() {
    if (!qrCanvas) return;
    var ctx = qrCanvas.getContext('2d');
    qrCanvas.width = 320;
    qrCanvas.height = 320;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, qrCanvas.width, qrCanvas.height);
    qrCanvas.classList.add('is-empty');
    if (qrEmpty) qrEmpty.classList.add('show');
  }

  function drawQrModules(canvas, modules) {
    if (!canvas || !modules || !modules.length) return;
    var size = modules.length;
    var quiet = 4;
    var width = 320;
    var height = 320;
    canvas.width = width;
    canvas.height = height;
    canvas.classList.remove('is-empty');
    if (qrEmpty) qrEmpty.classList.remove('show');

    var ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    var cell = Math.max(1, Math.floor(Math.min(width, height) / (size + quiet * 2)));
    var qrSize = cell * (size + quiet * 2);
    var offsetX = Math.floor((width - qrSize) / 2) + quiet * cell;
    var offsetY = Math.floor((height - qrSize) / 2) + quiet * cell;

    ctx.fillStyle = '#111827';
    for (var y = 0; y < size; y++) {
      for (var x = 0; x < size; x++) {
        if (modules[y][x]) ctx.fillRect(offsetX + x * cell, offsetY + y * cell, cell, cell);
      }
    }
  }

  function ensureQrReady() {
    if (qrLastResult) return true;
    renderQrTab();
    if (!qrLastResult) {
      showToast((qrStatus && qrStatus.textContent) || t('qr.emptyInput'), 'error');
      return false;
    }
    return true;
  }

  function downloadQrPng() {
    if (!qrCanvas || !ensureQrReady()) return;
    var link = document.createElement('a');
    link.href = qrCanvas.toDataURL('image/png');
    link.download = 'api-studio-qr-' + formatDownloadTimestamp(new Date()) + '.png';
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(t('qr.downloaded'));
  }

  function copyQrPng() {
    if (!qrCanvas || !ensureQrReady()) return;
    if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
      showToast(t('qr.copyUnsupported'), 'error');
      return;
    }
    qrCanvas.toBlob(function(blob) {
      if (!blob) {
        showToast(t('qr.copyUnsupported'), 'error');
        return;
      }
      navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]).then(function() {
        showToast(t('qr.copySuccess'));
      }).catch(function(error) {
        showToast(t('qr.copyFailed', { message: error && error.message ? error.message : String(error) }), 'error');
      });
    }, 'image/png');
  }

  function formatDownloadTimestamp(date) {
    function pad(value) { return String(value).padStart(2, '0'); }
    return date.getFullYear() + pad(date.getMonth() + 1) + pad(date.getDate()) + '-' + pad(date.getHours()) + pad(date.getMinutes()) + pad(date.getSeconds());
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

  function getCurrentDetailRequest() {
    var selected = selectedId ? findReq(selectedId) : null;
    if (selected) return selected;
    var detailUrl = (($('detailUrlFull') || {}).textContent || '').trim();
    var detailMethod = (($('detailMethod') || {}).textContent || 'GET').trim();
    var req = requests.find(function(item) {
      return item && item.url === detailUrl && (item.method || 'GET') === detailMethod;
    }) || null;
    if (req) selectedId = req.id;
    return req;
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
    if (!url) return t('common.notSet');
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
    ["detailUrl","detailMethod","detailStatus","detailContentType","detailReqHeaders","detailResHeaders","detailResBody"].forEach(function(id) {
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
    highlightDetailRequestBody(text, re, t);
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
    ["detailUrl","detailMethod","detailStatus","detailContentType","detailReqHeaders","detailResHeaders","detailResBody"].forEach(function(id) {
      var el = document.getElementById(id);
      if (id === 'detailResBody' && el && el.classList.contains('is-media')) return;
      if (el && el.innerHTML !== el.textContent) el.innerHTML = el.textContent;
    });
    clearDetailRequestBodyFindHighlights();
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
    updateDetailRequestBodyFindState();
    document.querySelectorAll("#requestBody tr.find-row").forEach(function(r) {
      r.classList.toggle("find-active-row", _findMatches[_findIdx] && _findMatches[_findIdx].el === r);
    });
  }

  function highlightDetailRequestBody(text, re, lowerNeedle) {
    var el = document.getElementById('detailReqBody');
    if (!el || !el.querySelector) return;
    clearDetailRequestBodyFindHighlights();
    var textNodes = collectTextNodes(el);
    textNodes.forEach(function(node) {
      var rawText = node.nodeValue || '';
      if (!rawText || rawText.toLowerCase().indexOf(lowerNeedle) === -1) return;
      var fragment = document.createDocumentFragment();
      var lastIndex = 0;
      rawText.replace(re, function(match, _group, offset) {
        if (offset > lastIndex) fragment.appendChild(document.createTextNode(rawText.slice(lastIndex, offset)));
        var span = document.createElement('span');
        span.className = 'find-match detail-request-body-match';
        span.textContent = match;
        fragment.appendChild(span);
        _findMatches.push({ el: el, span: span, match: match, offset: offset });
        lastIndex = offset + match.length;
        return match;
      });
      if (lastIndex < rawText.length) fragment.appendChild(document.createTextNode(rawText.slice(lastIndex)));
      if (fragment.childNodes.length > 0) node.parentNode.replaceChild(fragment, node);
    });
  }

  function collectTextNodes(root) {
    var nodes = [];
    if (!root || !root.ownerDocument) return nodes;
    var textNodeFilter = typeof NodeFilter !== 'undefined' ? NodeFilter.SHOW_TEXT : 4;
    var walker = document.createTreeWalker(root, textNodeFilter, null, false);
    var node;
    while ((node = walker.nextNode())) {
      if (!node.nodeValue || !node.nodeValue.trim()) continue;
      if (node.parentNode && node.parentNode.classList && node.parentNode.classList.contains('find-match')) continue;
      nodes.push(node);
    }
    return nodes;
  }

  function clearDetailRequestBodyFindHighlights() {
    var el = document.getElementById('detailReqBody');
    if (!el) return;
    el.querySelectorAll('.detail-request-body-match').forEach(function(span) {
      var tx = document.createTextNode(span.textContent);
      span.parentNode.replaceChild(tx, span);
    });
    if (el.normalize) el.normalize();
  }

  function updateDetailRequestBodyFindState() {
    var el = document.getElementById('detailReqBody');
    if (!el) return;
    el.querySelectorAll('.detail-request-body-match').forEach(function(span) {
      var current = _findMatches[_findIdx];
      span.classList.toggle('find-active', !!current && current.span === span);
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
    if (keys.length === 0) return t('common.empty');
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
    if (!cookies || cookies.length === 0) return t('common.empty');
    return cookies.map(function(item) {
      return item.name + '=' + item.value;
    }).join('\n');
  }

  function formatSetCookieLines(cookies) {
    if (!cookies || cookies.length === 0) return t('common.empty');
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
        ? tt('该响应是二进制资源，当前展示的是编码后的原始内容。', 'This is a binary response. Showing the encoded raw content.')
        : '';
      return;
    }

    if (contentLength === 0 || req.status === 204 || req.method === 'HEAD') {
      req.responseBodyState = 'empty';
      req.responseBodyMessage = tt('该请求没有可返回的响应体。', 'This request has no response body.');
      return;
    }

    if (isBinary) {
      req.responseBodyState = 'binary-unavailable';
      req.responseBodyMessage = tt('该响应是图片或其他二进制资源，浏览器这次没有返回可预览的内容。', 'This response is an image or other binary resource, and the browser did not provide previewable content this time.');
      return;
    }

    if (isStreamingLike(req, mimeType)) {
      req.responseBodyState = 'stream-unavailable';
      req.responseBodyMessage = tt('该请求更像流式或特殊接口，浏览器未提供完整响应体。', 'This looks like a streaming or special endpoint, and the browser did not provide the full response body.');
      return;
    }

    req.responseBodyState = 'unavailable';
    req.responseBodyMessage = tt('浏览器没有返回这条请求的响应体，通常是受资源类型、跨域策略或 DevTools 能力限制影响。', 'The browser did not return the response body, usually because of resource type, CORS policy, or DevTools capability limits.');
  }

  function formatResponseBodyDisplay(req, mimeType) {
    if (!req) return t('common.emptyText');
    var state = req.responseBodyState || '';
    if (req.responseContent) {
      if (state === 'binary' || req.responseEncoding === 'base64') {
        return formatBinaryBody(req);
      }
      return formatBody(req.responseContent, mimeType);
    }
    if (state === 'pending') return tt('响应体获取中...', 'Fetching response body...');
    if (state === 'empty') return req.responseBodyMessage || t('common.emptyText');
    return req.responseBodyMessage || tt('(未获取到响应体)', '(Response body not available)');
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
        ? tt('当前直接使用原始资源地址预览，适合较大的媒体文件。', 'Previewing directly from the original resource URL, which is better for large media files.')
        : tt('当前直接使用原始资源地址预览。', 'Previewing directly from the original resource URL.');
    }
    if (!previewSrc) return '';

    var mediaHtml = '';
    if (mediaKind === 'image') {
      mediaHtml = '<img class="response-preview-image" src="' + escAttr(previewSrc) + '" alt="' + escAttr(tt('响应图片预览', 'Response image preview')) + '">';
    } else if (mediaKind === 'video') {
      mediaHtml = '<video class="response-preview-video" controls preload="metadata" src="' + escAttr(previewSrc) + '"></video>';
      if (!note) note = tt('如果视频较大或为分片流媒体，播放器可能依赖原始地址继续分段加载。', 'For large or segmented video streams, the player may keep loading chunks from the original URL.');
    } else if (mediaKind === 'audio') {
      mediaHtml = '<audio class="response-preview-audio" controls preload="metadata" src="' + escAttr(previewSrc) + '"></audio>';
      if (!note) note = tt('音频资源会优先尝试直接播放。', 'Audio resources are previewed with direct playback when possible.');
    }

    var sourceLabel = req.responseEncoding === 'base64' && req.responseContent ? tt('base64 响应体', 'base64 response body') : tt('原始资源地址', 'original resource URL');
    var mediaKindLabel = mediaKind === 'image' ? tt('图片', 'image') : (mediaKind === 'video' ? tt('视频', 'video') : tt('音频', 'audio'));
    var parts = [
      '<div class="response-preview">',
      '<div class="response-preview-meta">' + escHtml(tt('已识别为{kind}资源，当前使用 {source} 预览。', 'Detected a {kind} resource. Previewing with {source}.', { kind: mediaKindLabel, source: sourceLabel })) + '</div>',
      mediaHtml,
      '<div class="response-preview-actions">' +
        '<a class="response-preview-link" href="' + escAttr(openUrl || previewSrc) + '" target="_blank" rel="noopener noreferrer">' + escHtml(tt('打开资源', 'Open resource')) + '</a>' +
        '<button type="button" class="response-preview-link copy-resource-url" data-url="' + escAttr(openUrl || previewSrc) + '">' + escHtml(tt('复制地址', 'Copy URL')) + '</button>' +
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
      tt('[二进制响应]', '[Binary response]')
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
    if (!text || text === t('common.empty') || text === '无') {
      showToast(tt('当前没有可复制的数据', 'Nothing to copy'), 'error');
      return;
    }
    ApiStudioCompat.copyText(text).then(function() {
      showToast(successMessage);
    }).catch(function(error) {
      showToast(tt('复制失败: {message}', 'Copy failed: {message}', { message: error.message }), 'error');
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
    if (!body) return t('common.emptyText');
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
    return String(str === undefined || str === null ? '' : str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

  function showUndoToast(message, undoFn) {
    var stack = document.getElementById('undoToastStack');
    if (!stack) {
      stack = document.createElement('div');
      stack.id = 'undoToastStack';
      stack.className = 'undo-toast-stack';
      document.body.appendChild(stack);
    }

    var item = document.createElement('div');
    item.className = 'undo-toast';
    item.dataset.undoToastId = String(++undoToastSeq);

    var text = document.createElement('span');
    text.className = 'undo-toast-message';
    text.textContent = message || '';

    var button = document.createElement('button');
    button.className = 'undo-toast-action';
    button.type = 'button';
    button.innerHTML = '<span class="undo-toast-icon" aria-hidden="true">↶</span><span>' + escHtml(t('undo.action')) + '</span>';

    item.appendChild(text);
    item.appendChild(button);
    stack.appendChild(item);

    var closed = false;
    function close() {
      if (closed) return;
      closed = true;
      item.classList.remove('show');
      item.classList.add('hide');
      setTimeout(function() {
        if (item.parentNode) item.parentNode.removeChild(item);
        if (stack && stack.parentNode && stack.children.length === 0) stack.parentNode.removeChild(stack);
      }, 240);
    }

    var timer = setTimeout(close, 3000);
    button.addEventListener('click', function() {
      clearTimeout(timer);
      try {
        if (typeof undoFn === 'function') undoFn();
      } finally {
        close();
      }
    });
    requestAnimationFrame(function() { item.classList.add('show'); });
  }

  function cloneData(value) {
    return value === undefined ? value : JSON.parse(JSON.stringify(value));
  }

  function insertAt(list, item, index) {
    var next = list.slice();
    var safeIndex = Math.max(0, Math.min(Number(index) || 0, next.length));
    next.splice(safeIndex, 0, item);
    return next;
  }

  function insertManyAtOriginalPositions(list, entries) {
    var next = list.slice();
    (entries || []).slice().sort(function(a, b) {
      return (Number(a.index) || 0) - (Number(b.index) || 0);
    }).forEach(function(entry) {
      next = insertAt(next, cloneData(entry.item), entry.index);
    });
    return next;
  }

  function restoreDeletedRules(entries) {
    entries = entries || [];
    if (!entries.length) return;
    chrome.storage.local.get(['rules', 'ruleHits'], function(result) {
      var ids = {};
      entries.forEach(function(entry) { if (entry && entry.item && entry.item.id) ids[entry.item.id] = true; });
      var nextRules = (result.rules || []).filter(function(rule) { return !ids[rule.id]; });
      var nextHits = Object.assign({}, result.ruleHits || {});
      entries.forEach(function(entry) {
        if (!entry || !entry.item || !entry.item.id) return;
        if (entry.hit === undefined) delete nextHits[entry.item.id];
        else nextHits[entry.item.id] = entry.hit;
      });
      nextRules = insertManyAtOriginalPositions(nextRules, entries);
      chrome.storage.local.set({ rules: nextRules, ruleHits: nextHits }, function() {
        rules = nextRules;
        ruleHits = nextHits;
        loadMockGroups(function() {
          updateHitSummary();
          renderRules();
        });
      });
    });
  }

  function restoreReplayHistoryEntries(entries, options) {
    entries = entries || [];
    options = options || {};
    if (!entries.length) return;
    var ids = {};
    entries.forEach(function(entry) { if (entry && entry.item && entry.item.id) ids[entry.item.id] = true; });
    replayHistory = replayHistory.filter(function(item) { return !ids[item.id]; });
    replayHistory = insertManyAtOriginalPositions(replayHistory, entries);
    replayGroups = uniqueReplayGroups([DEFAULT_REPLAY_GROUP].concat(replayGroups).concat(replayGroupsFromHistory(replayHistory)));
    if (options.group) activeReplayGroup = normalizeReplayGroup(options.group);
    selectedReplayHistoryIds = {};
    persistReplayGroups();
    persistReplayHistory();
    syncReplayGroupInput();
    renderReplayGroupDropdown();
    renderReplayHistory();
    if (options.focusId) applyReplayHistoryItem(options.focusId);
    else loadFirstVisibleReplayHistory();
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
            '<div class="app-dialog-title">' + escHtml(options.title || tt('提示', 'Notice')) + '</div>' +
            '<button class="app-dialog-close" type="button" aria-label="' + escAttr(tt('关闭', 'Close')) + '">×</button>' +
          '</div>' +
          '<div class="app-dialog-body">' +
            '<div>' + escHtml(options.message || '') + '</div>' +
            (hasInput ? '<input class="app-dialog-input" type="text" value="' + escAttr(options.defaultValue || '') + '">' : '') +
            (hasSelect ? '<input class="app-dialog-input app-dialog-search" type="text" placeholder="' + escAttr(tt('搜索分组...', 'Search groups...')) + '" value=""><div class="app-dialog-options"></div>' : '') +
          '</div>' +
          '<div class="app-dialog-footer">' +
            (options.type === 'alert' ? '' : '<button class="btn btn-secondary app-dialog-cancel" type="button">' + escHtml(tt('取消', 'Cancel')) + '</button>') +
            '<button class="btn btn-primary app-dialog-ok" type="button">' + escHtml(options.okText || t('common.confirm')) + '</button>' +
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
          optionsBox.innerHTML = '<div class="app-dialog-option-empty">' + escHtml(tt('没有匹配的分组', 'No matching groups')) + '</div>';
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
    return showAppDialog({ type: 'confirm', title: title, message: message, okText: okText || t('common.confirm') });
  }

  function appPrompt(title, message, defaultValue) {
    return showAppDialog({ type: 'prompt', title: title, message: message, defaultValue: defaultValue || '', okText: t('common.confirm') });
  }

  function appSelect(title, message, options, okText) {
    return showAppDialog({ type: 'select', title: title, message: message, options: options || [], okText: okText || t('common.move') });
  }

  // ======================================================================
  // INIT
  // ======================================================================

  applyLocale();
  loadThemeMode();
  applyTheme(themeMode, false);
  watchThemePreference();
  loadRules();        // Load mock rules
  chrome.storage.local.get('masterEnabled', function(result) {
    var enabled = result.masterEnabled !== false;
    if (masterToggle) masterToggle.checked = enabled;
    if (masterToggleText) masterToggleText.textContent = enabled ? t('mock.on') : t('mock.off');
    updateMockTabStatus(enabled);
  });
  loadBeaconConfig();
  loadCookieEntries();
  loadReplayHistory();
  loadCapturedMockRequests();
  loadQrText();
  restorePanelSplit();
  restoreReplaySplit();
  renderBeaconTab();
  renderCookiesTab();
  renderReplayBodyEditor({ forceRows: true });
  renderReplayHistory();
  renderQrTab();
  renderNetworkList(); // Render network tab (empty initially)
  updateBadge();
})();
