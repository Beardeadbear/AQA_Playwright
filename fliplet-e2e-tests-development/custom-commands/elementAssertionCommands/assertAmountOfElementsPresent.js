/**
 * Command for checking amount of elements present for Css locators
 */
exports.command = function (elementCssLocator, expectedAmountOfElementPresent) {
  return this
    .pause(1000)
    .elements('css selector', elementCssLocator, function (result) {
      this.assert.equal(result.value.length, expectedAmountOfElementPresent, 'Number of present elements matches the expected value and equals ' + result.value.length);
    });
};
