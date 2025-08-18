/**
 * Command to simplify switching to '.fl-widget-provider' frame
 * Works for most such frames
 * @param {String} elementToWaitFor - element that must be visible after switching to frame
 */
exports.command = function(elementToWaitFor) {
  return this
    .waitForElementVisible('.fl-widget-provider', this.globals.mediumWait)
    .pause(1000)
    .moveToElement('.fl-widget-provider', 1, 1)
    .element('css selector', '.fl-widget-provider', (result) => {
      this.elementIdAttribute(result.value.ELEMENT, 'name', (text) => {
        this
          .switchToFrameWithoutId('fl-widget-provider', text.value)
          .waitForElementVisible(elementToWaitFor, this.globals.longWait);
      })
    });
};