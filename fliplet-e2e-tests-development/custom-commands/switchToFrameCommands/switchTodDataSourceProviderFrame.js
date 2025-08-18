/**
 * Command to switch to '.fl-widget-provider' frame that is used for data source provider
 */

exports.command = function(lfdManagement){
  const elementAttributes = require('../../utils/constants/elementAttributes');
  const util = require('util');
  const dataSourceProviderWidgetLocator = '(//*[@class="fl-widget-provider"][contains(@data-package, "provider")])[%d]';
  const dataSourceProviderDropdownFieldLocator = '//label[@for="data-source-select"]|//a[contains(@class,"change-data-source")]';
  let providerFrameNumber = 1;

  this
    .perform(() => {
      if(lfdManagement === true){
        providerFrameNumber = 2;
      }
    });

  this
    .perform(() => {
      this
        .useXpath()
        .waitForElementPresent(util.format(dataSourceProviderWidgetLocator, providerFrameNumber), this.globals.mediumWait)
        .pause(1000)
        .moveToElement(util.format(dataSourceProviderWidgetLocator, providerFrameNumber), 1, 1)
        .element('xpath', util.format(dataSourceProviderWidgetLocator, providerFrameNumber), (result) => {
          this.elementIdAttribute(result.value.ELEMENT, elementAttributes.NAME, (text) => {
            this
              .switchToFrameWithoutId(util.format(dataSourceProviderWidgetLocator, providerFrameNumber), text.value)
          })
        })
        .waitForElementVisible(dataSourceProviderDropdownFieldLocator, this.globals.longWait)
        .useCss();
    });

  return this;
};