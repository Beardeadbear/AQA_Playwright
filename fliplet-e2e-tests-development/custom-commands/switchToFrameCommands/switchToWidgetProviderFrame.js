/**
 * Command for switching to frame with id 'widget-provider'
 * Works on multiple screens
 */
exports.command = function() {
  return this
    .waitForElementVisible('#widget-provider', this.globals.longWait)
    .switchToFrameWhenItIsLoaded('widget-provider');
};