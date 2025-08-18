/**
 * Command for checking amount of elements present for Xpath locators
 */
exports.command = function (elementCssLocator, expectedAmountOfElementPresent) {
  return this
    .pause(1000)
    .elements('xpath', elementCssLocator, function (result) {
      this.assert.equal(result.value.length, expectedAmountOfElementPresent, 'Number of present elements matches the expected value and equals ' + result.value.length);
    });
};
