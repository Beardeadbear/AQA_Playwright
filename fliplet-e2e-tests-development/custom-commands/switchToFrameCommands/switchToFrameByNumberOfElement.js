/**
 * Command to simplify switching to '.fl-widget-provider' frame
 * Works for most such frames
 * @param {String} elementToWaitFor - element that must be visible after switching to frame
 */
exports.command = function(numberOfElement) {
  return this
    .waitForElementVisible('.fl-widget-provider', this.globals.smallWait)
    .elements('css selector', '.fl-widget-provider', (result) => {
      this.elementIdAttribute(result.value[numberOfElement-1].ELEMENT, 'name', (text) => {
        this
          .switchToFrameWithoutId('fl-widget-provider', text.value);
      })
    });
};