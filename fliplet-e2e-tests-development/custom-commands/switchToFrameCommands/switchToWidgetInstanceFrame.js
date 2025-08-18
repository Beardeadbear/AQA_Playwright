/**
 * Command for switching to frame with id 'widget-instance'
 * Works on multiple screens
 */
exports.command = function() {
  return this
    .waitForElementVisible('#widget-instance', this.globals.longWait)
    .switchToFrameWhenItIsLoaded('widget-instance');
};