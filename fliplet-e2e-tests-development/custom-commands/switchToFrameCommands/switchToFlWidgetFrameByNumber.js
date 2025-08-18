exports.command = function(numberOfFrame){
  const locator = `(//iframe[@class="fl-widget-provider" and "com.fliplet.link"])[${numberOfFrame}]`;

  return this
    .useXpath()
    .waitForElementPresent(locator, this.globals.smallWait)
    .useCss()
    .element('xpath', locator, (result) => {
      this.elementIdAttribute(result.value.ELEMENT, 'name', (text) => {
        this.frame(text.value)
          .waitForElementNotVisible('.spinner-overlay', this.globals.longWait);
      })
    });
};