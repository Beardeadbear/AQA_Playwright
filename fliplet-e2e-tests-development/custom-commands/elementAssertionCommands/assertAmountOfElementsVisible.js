/**
 * Command for checking amount of elements visible for Css locators
 */
exports.command = function (elementCssLocator, expectedAmountOfElementVisible) {
  return this
    .waitForElementVisible(elementCssLocator, this.globals.mediumWait)
    .elements('css selector', elementCssLocator, function (resultElements) {
      this.assert.equal(resultElements.value.length, expectedAmountOfElementVisible);

      for (let i = 0; i < resultElements.value.length; i++) {
        this.elementIdDisplayed(resultElements.value[i].ELEMENT, function (result) {
          this.assert.ok(result.value, `Element ${i + 1} is displayed`)
        })
      }
    });
};