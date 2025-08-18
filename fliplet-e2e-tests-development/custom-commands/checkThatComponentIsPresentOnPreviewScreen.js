exports.command = function(component) {
  return this
    .frame(null)
    .switchToPreviewFrame()
    .waitForElementVisible(`[data-widget-package="${component}"]`, this.globals.mediumWait)
    .frame(null);
};