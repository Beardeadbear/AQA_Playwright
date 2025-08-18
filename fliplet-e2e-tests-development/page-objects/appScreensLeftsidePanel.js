const util = require('util');
const elementAttributes = require('../utils/constants/elementAttributes');
const values = require('../utils/constants/values');
const screenTitleInRightsidePanelAppScreensList = `//div[@class="screen-name" and text()="%s"]`;
const settingsIconByScreenTitle = '//div[@class="screen-name" and text()="%s"]//li[@class="screen-setting"]//i';
const appScreenDropdownMenuOption = '//ul[@class="dropdown-menu"]//*[text()="%s"]';
const screenPanelLocator = `//div[@class="screen-name" and text()="%s"]/parent::li`;
const screenLayoutLocator = '//div[div[p[text()="%s"]]]//div[contains(@class,"layout-thumb ")]';
const screenLayoutTagHolderLocator = `//div[@class="layout-tags-holder"]/div[contains(@class, "layout-tag") and text()="%s"]`;

const commands = {
  openMenuOptionsForScreen: function(screenTitle){
    this
      .waitForElementVisible('@appScreensList', this.api.globals.smallWait)
      .api.element('xpath', util.format(settingsIconByScreenTitle, screenTitle), (result) => {
      this
        .api.useXpath()
        .moveTo(result.value.ELEMENT)
        .waitForElementVisible(util.format(settingsIconByScreenTitle, screenTitle), this.api.globals.smallWait)
        .pause(2000)
        .elementIdClick(result.value.ELEMENT)
        .useCss();
    });

    return this
      .waitForElementNotPresent('@appScreenCreationLoadingSpinner', this.api.globals.longWait)
      .waitForElementVisible('@appScreenOptionDropdownMenu', this.api.globals.mediumWait);
  },

  selectActionForAppScreen: function(option){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(appScreenDropdownMenuOption, option), this.api.globals.smallWait)
      .pause(2000)
      .click(util.format(appScreenDropdownMenuOption, option))
      .waitForElementNotPresent(util.format(appScreenDropdownMenuOption, option), this.api.globals.longWait)
      .useCss();

    return this
      .waitForElementNotPresent('@appScreenCreationLoadingSpinner', this.api.globals.longWait);
  },

  confirmAppScreenDeletion: function(){
    return this
      .waitForElementVisible('@confirmButtonOnAppScreenDeleteModal', this.api.globals.smallWait)
      .click('@confirmButtonOnAppScreenDeleteModal')
      .waitForElementNotPresent('@confirmButtonOnAppScreenDeleteModal', this.api.globals.longWait);
  },

  assertScreenIsNotPresentInAppScreenList: function(screenTitle){
    this
      .waitForElementVisible('@appScreensList', this.api.globals.smallWait)
      .api.useXpath()
      .waitForElementNotPresent(util.format(screenTitleInRightsidePanelAppScreensList, screenTitle), this.api.globals.mediumWait)
      .assert.elementNotPresent(util.format(screenTitleInRightsidePanelAppScreensList, screenTitle),
      `There is no screen ${screenTitle} in the app.`)
      .useCss();

    return this;
  },

  assertScreenIsPresentInAppScreenList: function(screenTitle){
    this
      .waitForElementVisible('@appScreensList', this.api.globals.smallWait)
      .api.useXpath()
      .assert.elementPresent(util.format(screenTitleInRightsidePanelAppScreensList, screenTitle),
      `There is ${screenTitle} screen in the app.`)
      .useCss();

    return this;
  },

  enterScreenNameOnAppScreenModal: function(screenTitle){
    return this
      .waitForElementVisible('@inputFieldForScreenNameOnAppScreenModal', this.api.globals.smallWait)
      .clearValue('@inputFieldForScreenNameOnAppScreenModal')
      .setValue('@inputFieldForScreenNameOnAppScreenModal', screenTitle);
  },

  clickConfirmButtonOnAppScreenModal: function(){
    return this
      .waitForElementVisible('@confirmButtonOnAppScreenModal', this.api.globals.smallWait)
      .click('@confirmButtonOnAppScreenModal')
      .waitForElementNotPresent('@confirmButtonOnAppScreenModal', this.api.globals.smallWait)
      .waitForElementNotPresent('@appScreenCreationLoadingSpinner', this.api.globals.longWait)
  },

  checkTitleOfActiveScreen: function(screenTitle){
    this
      .api.frame(null);

    this
      .waitForElementVisible('@activeAppScreenTitle', this.api.globals.mediumWait)
      .expect.element('@activeAppScreenTitle').text.to.equal(screenTitle).before(this.api.globals.mediumWait);

    return this;
  },

  openScreenByName: function(screenTitle){
    this
      .api.frame(null)
      .useXpath()
      .waitForElementVisible(util.format(screenPanelLocator, screenTitle), this.api.globals.smallWait)
      .click(util.format(screenPanelLocator, screenTitle))
      .pause(2000)
      .assert.attributeContains(util.format(screenPanelLocator, screenTitle), elementAttributes.CLASS, values.ACTIVE ,
      `${screenTitle} screen is open.`)
      .useCss()
      .pause(2000);

    return this;
  },

  clickAddScreensButton: function(){
    return this
      .waitForElementVisible('@addScreensButton', this.api.globals.longWait)
      .click('@addScreensButton')
      .waitForElementVisible('@pageLayoutsOverlay', this.api.globals.mediumWait)
      .assert.containsText('@pageLayoutsOverlayTitle', 'Add screens', 'Screens layouts overlay is open.')
  },

  selectScreenLayoutByName: function(screenLayoutTitle){
    this
      .waitForElementVisible('@screenLayoutHolder', this.api.globals.smallWait)
      .waitForElementVisible('@screenLayoutTitle', this.api.globals.smallWait)
      .api.pause(2000)
      .useXpath()
      .waitForElementVisible(util.format(screenLayoutLocator, screenLayoutTitle), this.api.globals.smallWait)
      .click(util.format(screenLayoutLocator, screenLayoutTitle))
      .useCss();

    return this
      .waitForElementVisible('@buttonsOnPageLayoutOverlay', this.api.globals.smallWait);
  },

  clickAddScreenButtonOnLayout: function(){
    this
      .api.pause(2000);

    return this
      .waitForElementVisible('@addScreenButton', this.api.globals.mediumWait)
      .click('@addScreenButton')
      .waitForElementVisible('@inputFieldForScreenNameOnAppScreenModal',this.api.globals.mediumWait)
  },

  assertScreenIsPresentByName: function (screenTitle) {
    this
      .api.pause(1000)
      .useXpath()
      .assert.elementPresent(util.format(screenTitleInRightsidePanelAppScreensList, screenTitle),
      `The screen with title ${screenTitle} is present in the app.`)
      .useCss()
      .pause(1000);

    return this;
  },

  clickAddScreenButtonOnPageLayoutsOverlay: function(){
    this
      .api.pause(2000);

    return this
      .waitForElementVisible('@addScreenButtonOnPageLayoutOverlay', this.api.globals.mediumWait)
      .click('@addScreenButtonOnPageLayoutOverlay')
      .waitForElementVisible('@confirmButtonOnAppScreenModal',this.api.globals.mediumWait)
  },

  selectScreenLayoutOnPageLayoutsOverlay: function(screenLayoutTitle){
    this
      .waitForElementVisible('@pageLayoutPreview', this.api.globals.smallWait)
      .waitForElementVisible('@pageLayoutTitle', this.api.globals.smallWait)
      .api.pause(2000)
      .useXpath()
      .waitForElementVisible(util.format(screenLayoutLocator, screenLayoutTitle), this.api.globals.smallWait)
      .click(util.format(screenLayoutLocator, screenLayoutTitle))
      .useCss();

    return this
      .waitForElementVisible('@buttonsOnPageLayoutOverlay', this.api.globals.smallWait);
  },

  changeScreenLayout: function(screenLayoutTitle){
    this
      .waitForElementVisible('@pageLayoutPreview', this.api.globals.longWait)
      .waitForElementVisible('@pageLayoutTitle', this.api.globals.smallWait)
      .api.pause(2000)
      .useXpath()
      .waitForElementVisible(util.format(screenLayoutLocator, screenLayoutTitle), this.api.globals.smallWait)
      .waitForElementVisible(util.format(screenLayoutLocator, screenLayoutTitle), this.api.globals.smallWait)
      .click(util.format(screenLayoutLocator, screenLayoutTitle))
      .useCss()
      .acceptModalWindow();

    return this
      .waitForElementNotPresent('@appScreenCreationLoadingSpinner', this.api.globals.longWait);
  },

  chooseScreenLayoutTag: function(screenLayoutTag){
    this
      .api.useXpath()
      .waitForElementVisible(util.format(screenLayoutTagHolderLocator, screenLayoutTag), this.api.globals.smallWait)
      .click(util.format(screenLayoutTagHolderLocator, screenLayoutTag))
      .assert.attributeContains(util.format(screenLayoutTagHolderLocator, screenLayoutTag), elementAttributes.CLASS, values.ACTIVE)
      .useCss();

    return this;
  },

  clickAddScreensButtonOnLayout: function(){
    this
      .api.pause(2000);

    return this
      .waitForElementVisible('@addScreenButton', this.api.globals.mediumWait)
      .click('@addScreenButton')
      .waitForElementNotPresent('@appScreenCreationLoadingSpinner', this.api.globals.longWait);
  },
};

module.exports = {
  commands: [commands],
  elements: {
    appScreensList: {
      selector: '.screens.screens-manageable'
    },
    appScreenOptionDropdownMenu: {
      selector: '#contextual-menu .dropdown-menu'
    },
    confirmButtonOnAppScreenDeleteModal: {
      selector: '//strong[text()="Your screen content will be lost."]/ancestor::div[@class="modal-content"]//button[@class="btn btn-danger"]',
      locateStrategy: 'xpath'
    },
    cancelButtonOnAppScreenDeleteModal: {
      selector: '//strong[text()="Your screen content will be lost."]/ancestor::div[@class="modal-content"]//button[@class="btn btn-default"]',
      locateStrategy: 'xpath'
    },
    confirmButtonOnAppScreenModal: {
      selector: '//h4[contains(text(), "screen")]/parent::div/parent::div//button[@class="btn btn-primary"]',
      locateStrategy: 'xpath'
    },
    cancelButtonOnAppScreenModal: {
      selector: '//h4[contains(text(), "screen")]/parent::div/parent::div//button[@class="btn btn-default"]',
      locateStrategy: 'xpath'
    },
    inputFieldForScreenNameOnAppScreenModal: {
      selector: '//h4[contains(text(), "screen")]/parent::div/parent::div//input',
      locateStrategy: 'xpath'
    },
    appScreenCreationLoadingSpinner: {
      selector: '.loading-screen .spinner-holder.animated .spinner-overlay'
    },
    activeAppScreenTitle: {
      selector: '.screen-item.screen.active'
    },
    addScreensButton: {
      selector: '.screen-actions button'
    },
    addScreenButtonOnPageLayoutOverlay: {
      selector: '.btn-add-layout'
    },
    pageLayoutsOverlay: {
      selector: 'section.page-layouts'
    },
    pageLayoutsOverlayTitle: {
      selector: '.page-layouts h4[class*=title]'
    },
    buttonsOnPageLayoutOverlay: {
      selector: '.header-controls'
    },
    pageLayoutPreview: {
      selector: '.layout-title'
    },
    pageLayoutTitle: {
      selector: '.layout-title'
    },
    addScreenButton: {
      selector: '.btn-add-layout'
    },
    screenLayoutHolder: {
      selector: '.layout-preview-holder'
    },
    screenLayoutTitle: {
      selector: '.layout-title'
    }
  }
};