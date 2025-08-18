/**
 * Command for switching to frame with id 'preview'
 * Works on multiple screens
 */
exports.command = function(){
  return this
    .frame(null)
    .waitForElementPresent('.overlay-content-header', this.globals.smallWait)
    .switchToWidgetProviderFrame()
    .waitForElementVisible('#toolbar', this.globals.smallWait);
};