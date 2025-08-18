/**
 * This command is used for assertion that new window is opened and switching to it.
 * If new window is not opened, command clicks again on element for new window opening
 * Takes one parameter:
 * @param {String} selectorForWindowOpening - css selector to element which should open new window
 */

exports.command = function(selectorForWindowOpening, numberOfWindowToOpen=2){
  return this
    .windowHandles(function(result) {
      this.perform(function(){
        if (result.value.length == numberOfWindowToOpen) { // assertion that new window appeared
          this.api.switchWindow(result.value[numberOfWindowToOpen-1]);
        } else { // if new window didn't appear
          this.api
            .click(selectorForWindowOpening)
            .pause(2000)
            .windowHandles(function(newWindowsArray) {
              this.switchWindow(newWindowsArray.value[numberOfWindowToOpen-1]);
            })
        }
      })
    })
};