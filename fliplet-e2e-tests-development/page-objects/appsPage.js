const elementAttributes = require('../utils/constants/elementAttributes');
const util = require('util');
const applicationInMyAppsList = './/*[@class="app-name"][text()="%s"]';

const commands = {
  openAppByName: function(appName){
    const screensDisplaying = [];
    const previewDisplaying = [];

    return this
      .waitForElementVisible('.app-icon', this.api.globals.smallWait)
      .api.useXpath()
      .waitForElementVisible(util.format(applicationInMyAppsList, appName), this.api.globals.smallWait)
      .moveToElement(util.format(applicationInMyAppsList, appName), 0, 0)
      .pause(1500)
      .click(util.format(applicationInMyAppsList, appName))
      .useCss()
      .waitForElementVisible('.navbar-left>a', this.api.globals.longWait)
      .waitForElementVisible('.screens.screens-manageable', this.api.globals.longWait)
      .refresh()
      .waitForElementPresentWithoutErrors('.screens.screens-manageable', this.api.globals.tinyWait, screensDisplaying)
      .perform(function() {
        if (screensDisplaying[0] == false) { // if blank app page is opened
          this.api.refresh()
        }
      })
      .waitForElementVisible('ul.widgets', this.api.globals.longWait)
      .waitForElementVisible('.navbar-right', this.api.globals.longWait)
      .waitForElementPresentWithoutErrors('div[class="frame"] #preview', this.api.globals.tinyWait, previewDisplaying)
      .perform(function() {
        if (previewDisplaying[0] == false) { // if endless loader is present in app preview
          this.api.refresh()
        }
      })
      .waitForElementVisible('#preview', this.api.globals.longWait)
      .switchToPreviewFrame()
      .waitForElementNotPresent('.spinner-wrapper .spinner-circle', this.api.globals.smallWait)
      .waitForElementPresent('.mode-interact-ready', this.api.globals.smallWait)
      .frame(null)
      .pause(3000);
  },

  openAppWithoutEditPermission: function(appName){
    this
      .waitForElementVisible('.app-icon', this.api.globals.smallWait)
      .api.useXpath()
      .waitForElementVisible(util.format(applicationInMyAppsList, appName), this.api.globals.smallWait)
      .moveToElement(util.format(applicationInMyAppsList, appName), 0, 0)
      .pause(1500)
      .click(util.format(applicationInMyAppsList, appName))
      .useCss()
      .waitForElementVisible('#preview', this.api.globals.mediumWait)
      .waitForElementVisible('.navbar-left>a', this.api.globals.longWait)
      .waitForElementVisible('.screens.screens-manageable', this.api.globals.longWait)
      .waitForElementVisible('.navbar-right', this.api.globals.longWait)
      .switchToPreviewFrame()
      .waitForElementNotPresent('.spinner-wrapper .spinner-circle', this.api.globals.smallWait)
      .frame(null)
      .pause(3000);

      return this;
  },

  clickEditButtonUnderAppByName:function(name){
    const locator = `.//a[text()='${name}']/ancestor::div/following-sibling::div//a[text()="Edit"]`;

    return this
      .api.useXpath()
      .waitForElementVisible(locator, this.api.globals.smallWait)
      .click(locator)
      .useCss();
  },

  expandOptionsForAppByName: function(name){
    const buttonLocator = `.//div[contains(@class, "app-list-item-holder")]//a[text()='${name}']/ancestor::div/following-sibling::div//button[@id="dropdown-label"]`;
    const menuLocator = `.//div[contains(@class, "app-list-item-holder")]//a[text()='${name}']/ancestor::div/following-sibling::div//ul`;

    this
      .api.useXpath()
      .waitForElementVisible(buttonLocator, this.api.globals.longWait)
      .element('xpath', buttonLocator, (result) => {
        this
          .api.elementIdClick(result.value.ELEMENT)
          .waitForElementVisible(menuLocator, this.api.globals.smallWait);
      })
      .useCss();

    return this;
  },

  /** @param{String} name - app name
   * @param{String} title - f.e. Duplicate, Delete etc.*/
  selectOptionByTitle: function (name, title) {
    const optionLocator = `.//a[text()='${name}']/ancestor::div/following-sibling::div//li/a[text()='${title}']`;

    this
      .api.useXpath()
      .pause(1000)
      .click(optionLocator)
      .pause(1500)
      .useCss();

    return this;
    //waiter is not added as different events happen after clicking different options
  },

  deleteApplicationByName: function(name){
    const deleteOptionLocator = `.//a[text()='${name}']/ancestor::div/following-sibling::div//li/a/span`;
    const menuLocator = `.//div[contains(@class, "app-list-item-holder")]//a[text()='${name}']/ancestor::div/following-sibling::div//ul`;

    this
      .api.useXpath()
      .waitForElementVisible(deleteOptionLocator, this.api.globals.smallWait)
      .pause(1000)
      .click(deleteOptionLocator)
      .waitForElementVisible('.//div[@class="modal-body"]', this.api.globals.mediumWait)
      .waitForElementVisible('.//button[@class="btn btn-danger"]', this.api.globals.mediumWait)
      .waitForElementVisible('.//button[@class="btn btn-default"]', this.api.globals.mediumWait)
      .pause(500)
      .click('.//button[@class="btn btn-danger"]')
      .pause(500)
      .waitForElementNotPresent(menuLocator, this.api.globals.smallWait)
      .useCss();

    return this;
  },

  duplicateApplicationByName: function(newName){
    return this
      .waitForElementVisible('@duplicateTitleField', this.api.globals.smallWait)
      .clearValue('@duplicateTitleField')
      .setValue('@duplicateTitleField', newName)
      .click('.modal-footer .btn-primary')
      .waitForElementNotVisible('div.spinner-holder.animated', this.api.globals.longWait);
  },

  assertApplicationIsPresentInListByName: function (appName) {
    this
      .expect.section('@appList').to.be.visible.before(this.api.globals.longWait);

    this
      .api.useXpath()
      .assert.elementPresent(util.format(applicationInMyAppsList, appName), `The application with name ${appName} 
      is present in My apps list.`)
      .useCss();

    return this;
  },

  assertApplicationIsNotPresentInListByName: function (appName) {
    this
      .api.useXpath()
      .assert.elementNotPresent(util.format(applicationInMyAppsList, appName), `The application with name ${appName} 
      is not present in My apps list.`)
      .useCss();

    return this;
  },

  clickNewAppButton: function(){
    return this
      .waitForElementVisible('@createAppButton', this.api.globals.smallWait)
      .click('@createAppButton')
      .waitForElementNotVisible('.spinner-overlay', this.api.globals.longWait)
      .waitForElementVisible('.app-setup-overlay', this.api.globals.mediumWait);
  },

  waitForAppsPageToBeLoaded: function() {
    return this
      .waitForElementNotPresent('.spinner-holder.animated', this.api.globals.longWait)
      .waitForElementVisible('.navbar-top-holder',  this.api.globals.mediumWait)
      .waitForElementVisible('.create-app-button',  this.api.globals.mediumWait)
      .waitForElementVisible('.inspiration-img-holder',  this.api.globals.mediumWait)
      .assert.title('My apps');
  },

  waitForAppsListToBeLoaded: function(){
    this.expect.section('@appList').to.be.visible.before(this.api.globals.longWait);

    return this;
  },

  openAnalyticsByAppName: function(appName){
    const appAnalyticsButtonLocator = `.//a[text()='${appName}']/ancestor::div/following-sibling::div//a[text()='Analytics']`;

    return this
      .api.useXpath()
      .waitForElementVisible(appAnalyticsButtonLocator, this.api.globals.smallWait)
      .click(appAnalyticsButtonLocator)
      .useCss();
  },

  openNotificationsByAppName: function(appName){
    const appAnalyticsButtonLocator = `.//a[text()='${appName}']/ancestor::div/following-sibling::div//a[text()='Notifications']`;

    this
      .api.useXpath()
      .waitForElementVisible(appAnalyticsButtonLocator, this.api.globals.smallWait)
      .click(appAnalyticsButtonLocator)
      .useCss();

    return this;
  },

  assertAppHasTemplateLabel: function (appName) {
    const appTemplateLabelLocator = `//a[@class="app-name"][text()="${appName}"]/parent::div[@class="app-name-holder"]//span[@class="label label-default"]`;

    this
      .api.useXpath()
      .waitForElementVisible(appTemplateLabelLocator, this.api.globals.smallWait)
      .assert.containsText(appTemplateLabelLocator, "Template", 'The app has a template label')
      .useCss();

    return this;
  },

  assertAppHasIconImage: function (appName, iconImageId){
    const appIconImageLocator = `//a[@class="app-name"][text()="${appName}"]/ancestor::div[@class="app-info-holder"]//img`;

    this
      .api.useXpath()
      .waitForElementVisible(appIconImageLocator, this.api.globals.smallWait)
      .assert.attributeContains(appIconImageLocator, elementAttributes.SRC, iconImageId, 'The app has the correct icon.')
      .useCss();

    return this;
  }
};

module.exports = {
  url: function() {
    return this.api.launchUrl + '/apps';
  },
  commands: [commands],
  sections: {
    menu: {
      selector: '.navbar-top-holder'
    },
    appList: {
      selector: '.app-list'
    }
  },
  elements: {
    app: {
      selector: '.app-list-item'
    },
    modalWindowBody: {
      selector: './/div[@class="modal-body"]',
      locateStrategy: 'xpath'
    },
    deleteButton: {
      selector: './/button[@class="btn btn-danger"]',
      locateStrategy: 'xpath'
    },
    duplicateTitleField: {
      selector: '.bootbox-input.bootbox-input-text.form-control'
    },
    duplicateAppButton: {
      selector: '.btn-primary'
    },
    topMenu: {
      selector: '.navbar-top-holder'
    },
    createAppButton: {
      selector: '.create-app-button i'
    }
  }
};
