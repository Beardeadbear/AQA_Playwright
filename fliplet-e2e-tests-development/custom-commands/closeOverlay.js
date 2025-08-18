/**
 * This command is used for closing overlays
 */
exports.command = function(){
  const closeOverlayButton = '.overlay-close, .content-close i';

  return this
    .frame(null)
    .waitForElementVisible(closeOverlayButton, this.globals.tinyWait)
    .moveToElement(closeOverlayButton, 0, 0, function(){
      this.doubleClick();
    })
    .waitForElementNotPresent(closeOverlayButton, this.globals.smallWait);
};