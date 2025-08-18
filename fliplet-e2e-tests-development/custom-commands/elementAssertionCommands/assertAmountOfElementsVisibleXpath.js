/**
 * Command for checking amount of elements visible for Xpath locators
 */
exports.command = function(elementLocator, expectedAmountOfElementVisible){
  return this
    .waitForElementVisible(elementLocator, this.globals.mediumWait)
    .elements('xpath', elementLocator, function(resultElements){
      this.assert.equal(resultElements.value.length, expectedAmountOfElementVisible);

      for(let i = 0; i < resultElements.value.length; i ++){
        this.elementIdDisplayed(resultElements.value[i].ELEMENT, function(result){
          this.assert.ok(result.value, `Element ${i + 1} is displayed.`)
        })
      }
    });
};