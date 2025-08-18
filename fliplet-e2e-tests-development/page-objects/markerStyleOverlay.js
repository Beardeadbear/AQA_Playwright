const commands = {

  checkThatMarkerStyleOverlayIsOpen: function (headerText) {
    return this
      .waitForElementVisible('@markerStylesOverlayHeader', this.api.globals.smallWait)
      .assert.containsText('@markerStylesOverlayHeader', headerText)
      .assert.visible('@markerStylesOverlayBodyContent');
  },

  checkAbilityToAddAndDeleteNewStyles: function (styleNumber) {
    const activeMarkerPanelLocator = `(//div[@class="panel marker-panel panel-default"])[${styleNumber}]`;
    const deleteMarkerTrashLocator = `(//span[@class="icon-delete fa fa-trash"])[${styleNumber}]`;
    const markerPanelLocator = '.panel.panel-default';

    this
      .assertAmountOfElementsPresent(markerPanelLocator, 1)
      .click('@addNewStyleButton')
      .api.useXpath()
      .assertAmountOfElementsPresent(markerPanelLocator, 2)
      .waitForElementVisible(activeMarkerPanelLocator, this.api.globals.smallWait)
      .click(deleteMarkerTrashLocator)
      .frame(null)
      .useCss()
      .acceptModalWindow()
      .switchToWidgetInstanceFrame()
      .useXpath()
      .waitForElementNotPresent(activeMarkerPanelLocator, this.api.globals.smallWait)
      .assertAmountOfElementsPresent(markerPanelLocator, 1)
      .useCss();

    return this;
  },

  assertIconImage: function (iconName) {
    return this
      .waitForElementVisible('@selectedMarkerIcon', this.api.globals.smallWait)
      .assert.attributeContains('@selectedMarkerIcon', 'class', iconName.toLowerCase())
  },

  openMarkerStyleConsole: function () {
    return this
      .click('@markerStylePanel')
      .waitForElementVisible('@replaceIconButton', this.api.globals.mediumWait)
  },

  openIconPickerConsole: function () {
    return this
      .click('@replaceIconButton')
      .waitForElementPresent('@iconPickerConsole', this.api.globals.mediumWait)
      .switchToFLWidgetProviderFrame('div#fa');
  },

  closeMarkerStyleOverlay: function () {
    return this
      .click('@markerStylesOverlayCloseButton')
      .waitForElementNotPresent('@markerStylesOverlayHeader', this.api.globals.smallWait)
      .waitForElementNotPresent('@markerStylesOverlayCloseButton', this.api.globals.smallWait)
  },

  clickSelectAndSaveButtonForIcons : function(){
    const selectButtonLocator = '//a[text()="Select & Save"]';
    const saveAndCloseButtonLocator = `//a[text()="Save & Close"] | //a[text()="Save"]`;
    const resultDisplaying = [];

    this
      .api.frame(null)
      .useXpath()
      .waitForElementVisible(selectButtonLocator, this.api.globals.smallWait)
      .click(selectButtonLocator)
      .waitForElementPresentWithoutErrorsXpath(saveAndCloseButtonLocator, 5000, resultDisplaying)
      .perform(function(){
        if (resultDisplaying[0] == false) {
          this.api.click(selectButtonLocator);
        }
      })
      .waitForElementPresent(saveAndCloseButtonLocator, this.api.globals.mediumWait)
      .useCss();

    return this;
  },
};

module.exports = {
  commands: [commands],
  elements: {
    markerStylesOverlayCloseButton: {
      selector: '.marker-overlay-close'
    },
    markerStylesOverlayHeader: {
      selector: '.marker-overlay-content-header h3'
    },
    markerStylesOverlayBodyContent: {
      selector: '.marker-overlay-content-body'
    },
    addNewStyleButton: {
      selector: '.add-map-marker'
    },
    markerStylePanel: {
      selector: '//div[@class="panel marker-panel panel-default"]',
      locateStrategy: 'xpath',
      index: 1
    },
    replaceIconButton: {
      selector: '//span[contains(text(),"Replace icon")]',
      locateStrategy: 'xpath'
    },
    selectedMarkerIcon: {
      selector: '.icon-wrapper i'
    },
    iconPickerConsole: {
      selector: '.fl-widget-provider[data-package="com.fliplet.icon-selector"]',
    }
  }
};