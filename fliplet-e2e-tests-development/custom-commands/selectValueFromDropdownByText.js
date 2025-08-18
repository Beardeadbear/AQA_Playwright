/**
 * Command used to simplify selecting value from dropdown
 * @param {String} id - css id of element
 * @param {String} name - name of option
 */
exports.command = function(id, name){
  const locator = `//select[@id='${id}']/option[text()='${name}']`;
  this
    .useXpath()
    .waitForElementPresent(locator, this.globals.smallWait)
    .click(locator)
    .useCss();
  return this;
};