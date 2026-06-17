// Create the DevTools panel
var extensionApi = ApiStudioCompat.api || chrome;

extensionApi.devtools.panels.create(
  "API Studio",
  "icons/icon16.png",
  "devtools-panel.html"
);
