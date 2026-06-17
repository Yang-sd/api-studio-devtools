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

  // ====== DOM ======
  var $ = function(id) { return document.getElementById(id); };

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
  var configModalMode = '';
  var configEditingId = '';

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
      'config.new': '新建配置',
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
      'config.new': 'New config',
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

    setElementText('configModalCancelBtn', 'common.cancel');
    setElementText('configModalSaveBtn', 'common.save');
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
    if (tabCookies) tabCookies.classList.toggle('active', tab === 'cookies');
    if (tabReplay) tabReplay.classList.toggle('active', tab === 'replay');
    if (tab === 'mock') loadRules();
    if (tab === 'network') {
      syncImportedState();
      renderNetworkList();
      refreshDetailImportState();
    }
    if (tab === 'beacon') renderBeaconTab();
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
      item.querySelector('[data-action="delete"]').addEventListener('click', async function(e) {
        e.stopPropagation();
        if (await appConfirm(t('mock.deleteRuleTitle'), tt('删除规则「{name}」？', 'Delete rule "{name}"?', { name: rule.name || t('common.unnamed') }), t('common.delete'))) deleteRule(rule.id);
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

  async function deleteGroup(name) {
    var group = normalizeGroup(name);
    if (group === DEFAULT_GROUP) {
      showToast(tt('默认分组不能删除', 'The default group cannot be deleted'), 'error');
      return;
    }
    var ruleCount = rules.filter(function(rule) {
      return normalizeGroup(rule.group) === group;
    }).length;
    var message = ruleCount > 0
      ? tt('删除分组「{name}」？该分组下的 {count} 条规则会移动到默认分组。', 'Delete group "{name}"? {count} rules in it will be moved to the default group.', { name: group, count: ruleCount })
      : tt('删除分组「{name}」？', 'Delete group "{name}"?', { name: group });
    if (!await appConfirm(tt('删除分组', 'Delete group'), message, t('common.delete'))) return;

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
      showToast(tt('分组已删除', 'Group deleted'));
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
    chrome.runtime.sendMessage({ type: 'DELETE_RULE', ruleId: ruleId }, function() {
      delete selectedRuleIds[ruleId];
      if (editingRule && editingRule.id === ruleId) hideModal();
      loadRules();
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

  deleteRuleBtn.addEventListener('click', async function() {
    if (editingRule && await appConfirm(t('mock.deleteRuleTitle'), tt('删除规则「{name}」？', 'Delete rule "{name}"?', { name: editingRule.name || t('common.unnamed') }), t('common.delete'))) deleteRule(editingRule.id);
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
    batchDeleteBtn.addEventListener('click', async function() {
      var ids = Object.keys(selectedRuleIds);
      if (ids.length === 0) return;
      if (!await appConfirm(tt('批量删除', 'Batch delete'), tt('确定删除选中的 {count} 条规则？', 'Delete {count} selected rules?', { count: ids.length }), t('common.delete'))) return;
      var deleteMap = {};
      ids.forEach(function(id) { deleteMap[id] = true; });
      chrome.runtime.sendMessage({ type: 'DELETE_RULES', ruleIds: ids }, function() {
        selectedRuleIds = {};
        if (editingRule && deleteMap[editingRule.id]) hideModal();
        loadRules();
        showToast(tt('已删除 {count} 条规则', 'Deleted {count} rules', { count: ids.length }));
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
      resetLatestRequestState();
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
      resetLatestRequestState();
      renderNetworkList();
      renderBeaconTab();
      updateBadge();
      chrome.storage.local.set({ capturedRequests: [] });
      showToast(tt('埋点命中已清空', 'Beacon hits cleared'));
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
      cookieEntries = [];
      selectedCookieEntryId = null;
      persistCookieEntries();
      renderCookiesTab();
      showToast(tt('Cookies 已清空', 'Cookies cleared'));
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
      cookieEntries = cookieEntries.filter(function(item) { return item.id !== selectedCookieEntryId; });
      selectedCookieEntryId = cookieEntries[0] ? cookieEntries[0].id : null;
      persistCookieEntries();
      renderCookiesTab();
      showToast(tt('Cookies 记录已删除', 'Cookies entry deleted'));
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
      replayHistory = replayHistory.filter(function(item) { return !selectedReplayHistoryIds[item.id]; });
      selectedReplayHistoryIds = {};
      persistReplayHistory();
      renderReplayHistory();
      setReplayStatus(tt('已删除 {count} 条保存请求', 'Deleted {count} saved requests', { count: ids.length }), 'success');
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
  restorePanelSplit();
  restoreReplaySplit();
  renderBeaconTab();
  renderCookiesTab();
  renderReplayBodyEditor({ forceRows: true });
  renderReplayHistory();
  renderNetworkList(); // Render network tab (empty initially)
  updateBadge();
})();
