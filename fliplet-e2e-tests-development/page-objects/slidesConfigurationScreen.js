const util = require('util');
const slidePanelLocator = '(//div[@class="panel panel-default"]//span[@class="panel-title-text"])[%s]';
const expandedSlidePanelLocator = '(//div[starts-with(@id, "collapse")]//div[@class="form-horizontal"])[%s]';

const commands = {
  clickAddNewSlideButton: function(slideNumber){
    this
      .api.pause(3000);

    this
      .waitForElementVisible('@addNewSlideButton', this.api.globals.mediumWait)
      .click('@addNewSlideButton')
      .api.useXpath()
      .waitForElementVisible(util.format(slidePanelLocator, slideNumber), this.api.globals.mediumWait)
      .useCss();

    return this;
  },

  clickAddImageForSliderButton: function(){
    return this
      .waitForElementVisible('@addImageButton', this.api.globals.mediumWait)
      .click('@addImageButton')
      .switchToFLWidgetProviderFrame('#app');
  },

  collapseSlidePanel: function(slideNumber){
    this
      .api.frame(null)
      .switchToWidgetInstanceFrame()
      .useXpath()
      .waitForElementVisible(util.format(slidePanelLocator, slideNumber), this.api.globals.smallWait)
      .moveToElement(util.format(slidePanelLocator, slideNumber), 0, 0)
      .pause(1000)
      .click(util.format(slidePanelLocator, slideNumber))
      .waitForElementNotVisible(util.format(expandedSlidePanelLocator, slideNumber), this.api.globals.mediumWait)
      .useCss();

    return this;
  },

  expandSlidePanel:  function(slideNumber){
    this
      .api.frame(null)
      .switchToWidgetInstanceFrame()
      .useXpath()
      .waitForElementVisible(util.format(slidePanelLocator, slideNumber), this.api.globals.smallWait)
      .click(util.format(slidePanelLocator, slideNumber))
      .waitForElementVisible(util.format(expandedSlidePanelLocator, slideNumber), this.api.globals.mediumWait)
      .useCss();

    return this;
  },

  configureSkipButtonInSliderOptions: function () {
    return this
      .waitForElementVisible('@enableSkipYesButton', this.api.globals.smallWait)
      .click('@enableSkipYesButton')
      .assert.cssProperty('@enableSkipYesButton', 'background-color', 'rgba(0, 171, 210, 1)')
      .switchToFLWidgetProviderFrame('#transition')
  },

  checkExpandCollapsePanelsFunctionality(){
    this
      .api.pause(3000);

    return this
      .waitForElementVisible('@expandCollapseAllButton', this.api.globals.smallWait)
      .click('@expandCollapseAllButton')
      .waitForElementNotVisible('@expandedSlidePanelBody', this.api.globals.smallWait)
  },

  removeSlidePanel: function(slideNumber){
    const deleteSlideTrashLocator = `(//span[@class='icon-delete fa fa-trash'])[${slideNumber}]`;

    this
      .api.useXpath()
      .click(deleteSlideTrashLocator)
      .waitForElementNotPresent(util.format(slidePanelLocator, slideNumber), this.api.globals.smallWait)
      .useCss();

    return this;
  },

  changeSlideTitle: function(slideTitle){
    return this
      .waitForElementVisible('@expandedSlidePanelTitleInputField', this.api.globals.tinyWait)
      .clearValue('@expandedSlidePanelTitleInputField')
      .setValue('@expandedSlidePanelTitleInputField', slideTitle);
  },

  changeSlideDescription: function(slideDescription){
    return this
      .waitForElementVisible('@expandedSlidePanelDescriptionTextarea', this.api.globals.tinyWait)
      .setValue('@expandedSlidePanelDescriptionTextarea', slideDescription);
  },

  enterTitleForSlideButton: function(slideNumber, slideButtonLabel){
    const slideButtonInputFieldLocator = `(//input[@class="form-control list-item-link-label"])[${slideNumber}]`;

    this
      .api.frame(null)
      .switchToWidgetInstanceFrame()
      .useXpath()
      .waitForElementVisible(slideButtonInputFieldLocator, this.api.globals.smallWait)
      .setValue(slideButtonInputFieldLocator, slideButtonLabel)
      .useCss();

    return this;
  },

  getSlideImageId: function(slideNumber,imageId) {
    const imageHolderLocator = `(//div[@class="onboarding-content"]//img[@class="swiper-slide-image"])[${slideNumber}]`;

    this
      .switchToPreviewFrame()
      .api.useXpath()
      .waitForElementPresent(imageHolderLocator, this.api.globals.smallWait)
      .useCss();

    this.api.element('xpath', imageHolderLocator, function (result) {
      this.elementIdAttribute(result.value.ELEMENT, 'src', function (property) {
        return imageId.push(property.value.match(/.*\/media\/files\/(.*)\//)[1]);
      })
    })
      .frame(null);
  }
};

module.exports = {
  commands: [commands],
  elements: {
    enableSkipYesButton: {
      selector: '[for="enable-skip-yes"]'
    },
    expandCollapseAllButton: {
      selector: '.controls.clearfix .btn.btn-link.expand-items'
    },
    expandedSlidePanelBody: {
      selector: '.panel-body .form-horizontal'
    },
    expandedSlidePanelTitleInputField: {
      selector: 'div[class^=panel-collapse]:not([aria-expanded=false]) input[id*=title]'
    },
    expandedSlidePanelDescriptionTextarea: {
      selector: 'div[class^=panel-collapse]:not([aria-expanded=false]) textarea[id*=desc]'
    },
    addImageButton: {
      selector: 'div[class*=active] div[class*=background-image] div[class*=set],[class*=active] div[class^=panel-collapse]:not([aria-expanded=false]) div[class*=set]'
    },
    addNewSlideButton: {
      selector: '//div[@class="controls clearfix"]//div[text()="Add new slide"]',
      locateStrategy: 'xpath'
    }
  }
};