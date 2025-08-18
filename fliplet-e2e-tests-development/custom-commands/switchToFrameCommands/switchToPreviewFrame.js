/**
 * Command for switching to frame with id 'preview'
 * Works on multiple screens
 */
exports.command = function(){
  return this
    .waitForElementVisible('#preview', this.globals.mediumWait)
    .switchToFrameWhenItIsLoaded('preview');
};