// DevTools 外层页面负责感知面板显隐，面板隐藏后通知抓包层释放网络监听。
var extensionApi = ApiStudioCompat.api || chrome;

function bindPanelLifecycle(panel) {
  if (!panel || !panel.onShown || !panel.onHidden) return;
  var panelWindow = null;

  function publishVisibility(visible, shownWindow) {
    if (shownWindow) panelWindow = shownWindow;
    if (!panelWindow) return;
    panelWindow.__API_STUDIO_PANEL_VISIBLE__ = visible;
    if (panelWindow.ApiStudioCaptureLifecycle && typeof panelWindow.ApiStudioCaptureLifecycle.setPanelVisible === 'function') {
      panelWindow.ApiStudioCaptureLifecycle.setPanelVisible(visible);
    }
  }

  panel.onShown.addListener(function(shownWindow) {
    publishVisibility(true, shownWindow);
  });
  panel.onHidden.addListener(function() {
    publishVisibility(false);
  });
}

if (typeof browser !== 'undefined' && extensionApi === browser) {
  extensionApi.devtools.panels.create(
    'API Studio',
    'icons/icon16.png',
    'devtools-panel.html'
  ).then(bindPanelLifecycle).catch(function() {});
} else {
  extensionApi.devtools.panels.create(
    'API Studio',
    'icons/icon16.png',
    'devtools-panel.html',
    bindPanelLifecycle
  );
}
