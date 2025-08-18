/**
 * Command used to simplify selecting value from dropdown
 * @param {String} id - css id of element
 * @param {String}value - selected value
 */
exports.command = function(id, value){
  const locator = `#${id} option[value="${value}"]`;
  this
    .waitForElementPresent(locator, this.globals.smallWait)
    .click(locator);
  return this;
};